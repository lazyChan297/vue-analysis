import { Dep } from './dep.js'

// 将data转换为响应式对象
export default function reactive(data) {
	if (data !== null && typeof data === 'object') {
 		Object.keys(data).forEach(key => {
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

