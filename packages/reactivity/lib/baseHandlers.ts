import { track, trigger } from './effect'

function get(target, key) {
  // 依赖收集
  track (target, key)
  return target[key]
}
function set(target, key, newValue) {
  target[key] = newValue
  // 触发副作用函数执行
  trigger (target, key)
  return true
}

export const mutableHandlers = {
  get,
  set
}