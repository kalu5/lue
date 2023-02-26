import { track, trigger } from './effect'

function get(target, key,receiver) {
  // 依赖收集
  track (target, key)
  const res = Reflect.get(target, key, receiver)
  return res
}
function set(target, key, newValue, receiver) {
  Reflect.set(target, key, newValue, receiver)
  // 触发副作用函数执行
  trigger (target, key)
  return true
}

export const mutableHandlers = {
  get,
  set
}