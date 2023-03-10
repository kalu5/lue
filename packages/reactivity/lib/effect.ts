import { ITEREAT_KEY, shouldTrack } from './baseHandlers'

interface Option {
  scheduler?: (fn: EffectFunc) => void;
  lazy?: boolean
}


export type EffectFunc = { (): void; options: Option; deps: EffectFunc[]; }

// 存储当前的副作用函数
export let activeEffect: EffectFunc | null = null

// 存储代理对象的副作用函数
/**
 * target: {
 *    key: [effect, effect]
 * }
*/
const proxyMap = new WeakMap()

// 利用栈结构，解决嵌套的effect，建立清晰的响应式连接
const stackEffect: EffectFunc[] = []

export function track(target, key) {
  if (!activeEffect || !shouldTrack) return 
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

export function trigger(target, key, type, newValue) {
  const depsMap = proxyMap.get(target)
  if (!depsMap) return 
  const deps = depsMap.get(key)
  // if (!deps) return
  // Set结构， delete add 会死循环，用新Set处理
  const depsTorun = new Set(deps)
  deps && deps.forEach(fn => {
    // 避免无限制递归循环
    if (activeEffect !== fn) {
      depsTorun.add(fn)
    }
  })

  // 执行ITEREAT_KEY 收集的依赖
  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffect = depsMap.get(ITEREAT_KEY)
    iterateEffect && iterateEffect.forEach(fn => {
      if (activeEffect !== fn) {
        depsTorun.add(fn)
      }
    })
  }

  // 当是数组并且是新增，将与length相关的副作用函数收集执行
  if (Array.isArray(target) && type === 'ADD') {
    const lenEffect = depsMap.get('length')
    lenEffect && lenEffect.forEach(fn => {
      if (activeEffect !== fn ) {
        depsTorun.add(fn)
      }
    })
  }

  // 修改length为0时，要将大于等于新值的effect取出并执行
  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, index) => {
      if (index >= newValue) {
        effects.forEach((fn) => {
          if (activeEffect !== fn ) {
            depsTorun.add(fn)
          }
        })
      }
    })
  }

  depsTorun.forEach((fn: any) => {
    fn.options.scheduler 
    ? fn.options.scheduler(fn)
    : fn()
  })
  
}

export function effect (fn, options: Option = {}) {
  const effectFn = () => {
    let res
    try {
      cleanup(effectFn)
      activeEffect = effectFn
      stackEffect.push(activeEffect)
      res = fn()
    } finally {
      activeEffect = null
    }
    return res
  }
  effectFn.options = options
  // 当前副作用的所有依赖
  effectFn.deps = []
  
  if (!options.lazy) {
    effectFn()
  }
  
  stackEffect.pop()
  activeEffect = stackEffect[stackEffect.length-1]
  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0 ; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}