import { Dep, popTarget, pushTarget } from "./dep.js"

// 观察者 （观察data的变量）
class Watcher {
    /**
     * 
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