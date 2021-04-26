import Watcher from './watcher.js'
// watch与computed很相似，区别只在于当watch依赖的属性更新时它会立即执行更新后的callback
export default function watch(getter, cb) {
    new Watcher(getter, {watch: true, cb})
}