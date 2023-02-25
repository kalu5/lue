import { mutableHandlers } from './baseHandlers'

// 缓存代理对象，每次调用都会产生新的代理对象
const reactiveMap = new WeakMap()

export function reactive(target) {
  // 优先从缓存中读取
  const exisitionProxy = reactiveMap.get(target)
  if (exisitionProxy) return exisitionProxy
  const proxy = createReactiveObject(target, reactiveMap, mutableHandlers)
  // 存入缓存
  reactiveMap.set(target, proxy)
  return proxy
}

function createReactiveObject(target, proxyMap, proxyHandlers ) {
  if (typeof target !== 'object') {
    console.warn('target必须是对象')
    return target
  }
  const proxy = new Proxy(target, proxyHandlers)
  return proxy
}

