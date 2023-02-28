import { track, trigger } from './effect'
import { reactive } from './reactive'

function createGetter(shallow: boolean) {
  return function get(target, key,receiver) {
    // 依赖收集
    track (target, key)
    const res = Reflect.get(target, key, receiver)
    // 深层响应
    if (typeof res === 'object' && res !== null) {
      return shallow ? res : reactive(res)
    }
    return res
  }
}

function set(target, key, newValue, receiver) {
  Reflect.set(target, key, newValue, receiver)
  // 触发副作用函数执行
  trigger (target, key)
  return true
}

export const mutableHandlers = {
  get: createGetter(false),
  set
}

export const shallowMutableHandles = {
  get: createGetter(true), 
  set
}