import { effect } from "./effect";

export function watch(source, cb: Function) {
  // source可能时对象或getter
  let getter 
  typeof source === 'function'
  ?
  getter = source
  :
  // 监听对象中的每一个属性变化
  getter = () => traverse(source)

  effect(getter, {
    scheduler() {
      cb()
    }
  })
}

function traverse(source, seen = new Set()) {
  if (typeof source !== 'object' || source === null || seen.has(source))
  seen.add(source)
  // 只考虑对象
  for(let key in source) {
    traverse(source[key], seen)
  }
  return source
}