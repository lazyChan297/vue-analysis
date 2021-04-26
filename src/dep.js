// Dep负责维护data的观察者列表
class Dep {
    constructor() {
        this.subs = new Set()
    }
    // 添加观察者
    addSub() {
        if (Dep.target) {
            this.subs.add(Dep.target)
        }
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
