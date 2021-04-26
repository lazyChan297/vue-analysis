# vue-analysis

##### vue.2.x.x响应式原理

###### 实现响应式对象

首先将data变为响应式，当data发生改变依赖data的对象可以自动更新

```javascript
export default function reactive(data) {
	if (data !== null && typeof data === 'object') {
 		Object.keys(data).forEach(key => {
      			// 首先将对象转换为响应式对象
            defineReactive(data, key)
        })
  } 	
}

// 转换为响应式对象的核心实现基于Object.defineProperty
function defineReactive(data, key) {
	let value = data[key]
  const dep = new Dep()
  Object.defineProperty(data, key, {
    // 劫持get，收集依赖
    get() {
      // 收集依赖
      dep.addSub()
      return value
    },
    set(newVal) {
      value = newVal
      // 劫持set，派发更新
      dep.notify()
    }
  })
  // 如果data属性也是对象 递归处理
  if (value && typeof value === 'object') {
    reactive(value)
  }
}
```

###### 实现订阅者

为data添加一个订阅者`Dep`，`Dep`负责为响应式对象data添加观察者`addSub()` 和派发更新`notify`

```javascript
class Dep {
    constructor() {
        this.subs = new Set()
    }
    // 添加观察者
    addSub() {
        if (Dep.target)  this.subs.add(Dep.target)
    }
    // 通知所有观察者
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

// targetStack负责缓存正在更新的watcher
const targetStack = []

// 将上一个watcher push到targetStack，把当前的watcher赋值给Dep.target
function pushTarget(target) {
    if (Dep.target) targetStack.push(Dep.target)
    Dep.target = target
}

// 把Dep.target赋值给上一个watcher
function popTarget() {
    Dep.target = targetStack.pop()
}

export {
    Dep,
    targetStack,
    pushTarget,
    popTarget
}
```

###### 实现观察者

`Watcher`负责构造观察者实例和执行实例的update方法

`watcher`实例观察data，当data发生变化时立即作出相应执行`update`方法

```javascript
// 观察者 （观察data的变量）
class Watcher {
    /**
     * @param {*} getter getter函数会触发data的get方法收集依赖
     * @param {*} opt computed watcher cb（watch的回调函数） 
     */
    constructor(getter, opt = {}) {
        // getter 触发收集依赖的function
        this.getter = getter
        let { computed, watch, cb } = opt
        this.computed = computed
        this.watch = watch
        this.cb = cb
        if (this.computed) {
            // 观察者为computed,增加它的观察者Set
            this.dep = new Dep()
        } else {
            // 执行get求值方法，computed存在惰性加载所以初始化时不会执行
            this.get()
        }
    }
    // 求值
    get() {
        // 将Dep.target赋值给当前watcher
        pushTarget(this)
        // 收集依赖&返回观察到最新的值
        this.value = this.getter()
        // 将Dep.target重新赋值给上一个watcher
        popTarget()
        return this.value
    }
    update() {
        if (this.computed) {
            // 计算属性watcher通知它自身的观察者,和劫持data的set派发更新相同
            this.dep.notify()
            this.get()
        } else if (this.watch) {
            // 缓存上一个值
            const oldVal = this.value
            this.value = this.get()
            // 执行watch的回调
            this.cb(this.value, oldVal)
        } else {
            this.get()
        }
    }
    addSub() {
        this.dep.addSub()
    }
}

export default Watcher
```

###### 实现计算属性

computed既是一个响应式对象同时也是一个观察者

作为响应式对象时与data一样拥有自己的订阅者和观察者列表

作为观察者时与watcher一样，依赖其他属性 `computed: {sum(){return a + b}}`

```javascript
/**
 * @param {*} getter 触发computed属性依赖的对象的get方法的回调函数
 * @returns 
 */
export default function computed(getter) {
    let computedWatcher = new Watcher(getter, { computed: true })
    let result = {}
    Object.defineProperty(result, 'value', {
        get() {
            // 收集computed的依赖
            computedWatcher.addSub()
            // 返回它所依赖对象的value
            return computedWatcher.get()
        }
    })
    return result
}
```

###### 实现watch

watch与computed很相似，区别只在于当watch依赖的属性更新时它会立即执行更新后的callback不会缓存

```javascript
function watch(getter, cb) {
  new Watcher(getter, {watch: true, cb})
}
```

###### 使用示例

基于以上代码，测试功能是否实现

```javascript
let hotel = {
  address: '人民中路111号',
  price: 1000,
}

// 将hotel变为响应式
reactive(hotel)
// 创建观察者louis
new Watcher(() => {
    console.log(`louis already received the address ${hotel.address}`)
})
// 创建观察者Jackson
new Watcher(() => {
    console.log(`jackson already received the address ${hotel.address}`)
})

// 修改address
hotel.address = '人民中路112号'

// 创建totals对象并把它变为响应式
let totals = {days: 1}
reactive(total)
// 创建计算属性sum. 
let sum = computed(() => {
    log(`Latest price is ${total.days * hotel.price}`)
})

// sum计算属性的依赖,触发计算属性的get
let depend = sum.value

// watch
watch(function(){
    return hotel.address
}, (val, oldVal) => {
    log(`地址已经从${oldVal}替换为新地址：${val}`)
})

hotel.address = '人民中路113号'
```

###### 总结

Vue.2.x.x的响应式原理是基于Object.prototype劫持对象的get和set方法；

为对象创建一个订阅者，当触发data的get方法时收集依赖添加观察者；触发set方法时派发更新通知观察者

观察者被添加后可以观察data，当data更新后可以自动响应执行update