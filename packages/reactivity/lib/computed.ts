import { effect, trigger, track } from "./effect";

export function computed(getter) {
  let value;
  let dirty = true // 避免多次计算
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        // 手动触发响应
        trigger(obj, 'value')
      }
      
    }
  })

  let obj = {
    get value () {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 手动收集依赖，在副作用函数函数中访问计算属性的值时，当修改值时应该触发副作用执行
      track(obj, 'value')
      return value
    }
  }

  return obj

}