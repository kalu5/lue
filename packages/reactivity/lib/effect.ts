// 存储当前的副作用函数
export let activeEffect = null

export function getActiveEffect() {
  return activeEffect
}

// 存储代理对象的副作用函数
/**
 * target: {
 *    key: [effect, effect]
 * }
*/
const proxyMap = new WeakMap()

export function track(target, key) {
  if (!activeEffect) return 
  let depsMap = proxyMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    proxyMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }
  deps.add(activeEffect)
}

export function trigger(target, key) {
  const depsMap = proxyMap.get(target)
  if (!depsMap) return 
  const deps = depsMap.get(key)
  if (!deps) return
  deps.forEach(fn => fn())
}

export function effect (fn) {
  activeEffect = fn
  // 触发get函数
  fn()
}