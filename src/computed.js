import Watcher from './watcher.js'

/**
 * computed既是一个响应式对象同时也是一个观察者
   作为响应式对象时与data一样拥有自己的订阅者和观察者列表
   作为观察者时与watcher一样，依赖其他属性 `computed: {sum(){return a + b}}`
 * 
 * 同时computed也是一个响应式对象，所以它的get方法也需要被劫持用来收集computed的依赖 
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