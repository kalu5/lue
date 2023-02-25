// 存储当前的副作用函数
export let activeEffect = null

export function getActiveEffect() {
  return activeEffect
}

export function effect (fn) {
  activeEffect = fn
  // 触发get函数
  fn()
}