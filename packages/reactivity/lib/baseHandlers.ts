import { track, trigger } from './effect'
import { reactive } from './reactive'
import { hasOwnProperty } from './utils/index'

export let ITEREAT_KEY = Symbol()

function createGetter(shallow: boolean) {
  return function get(target, key,receiver) {
    // 通过raw获取原始对象
    if (key === 'raw') return target
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
  // 保存旧值
  const oldVal = target[key]
  // 区分是赋值还是新增值
  const type = hasOwnProperty(target, key) ? 'SET' : 'ADD'
  Reflect.set(target, key, newValue, receiver)
  // 只有代理对象和原始对象相等，才触发响应（解决访问原型属性时多次响应）
  if (receiver.raw === target) {
    // 触发副作用函数执行(新旧值不同时,排除NaN)
    if (oldVal !== newValue && (oldVal === oldVal || newValue === newValue)) {
      trigger (target, key, type)
    }
  }
  
  return true
}

function deleteProperty (target, key) {
  const hasKey = hasOwnProperty(target, key)
  
  const res = Reflect.deleteProperty(target, key)
  if (hasKey && res) {
    trigger(target, key, 'DELETE')
  }
  return res
}

// for in 迭代建立联系
function ownKeys (target) {
  track(target, ITEREAT_KEY)
  const res = Reflect.ownKeys(target)
  return res
}

function has (target, key) {
  track(target, key)
  return Reflect.has(target, key)
}

export const mutableHandlers = {
  get: createGetter(false),
  set,
  has,
  deleteProperty,
  ownKeys
}

export const shallowMutableHandles = {
  get: createGetter(true), 
  set,
  deleteProperty,
  ownKeys
}