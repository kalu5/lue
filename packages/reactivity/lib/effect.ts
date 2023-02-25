// 存储当前的副作用函数
export let activeEffect = null

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
  // 将所有依赖添加到deps中，执行副作用函数之前，清除
  activeEffect.deps.push(deps)
}

export function trigger(target, key) {
  const depsMap = proxyMap.get(target)
  if (!depsMap) return 
  const deps = depsMap.get(key)
  if (!deps) return
  // Set结构， delete add 会死循环，用新Set处理
  const depsTorun = new Set(deps)
  depsTorun.forEach(fn => fn())
  
}

export function effect (fn) {
  const effectFn = () => {
    try {
      cleanup(effectFn)
      activeEffect = effectFn
      fn()
    } finally {
      activeEffect = null
    }
  }
  // 当前副作用的所有依赖
  effectFn.deps = []
  effectFn()
  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0 ; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}