import { effect } from "./effect";
interface WatchOptions {
  immediate?: boolean;
  flush?: string;
}

export function watch(source, cb: Function, options: WatchOptions = {}) {
  // source可能时对象或getter
  let getter 
  typeof source === 'function'
  ?
  getter = source
  :
  // 监听对象中的每一个属性变化
  getter = () => traverse(source)

  let oldVal
  let newVal

  let clean 

  function onInvalid(fn) {
    clean = fn
  }

  const job = () => {
    newVal = effectFn()
    if (clean) clean()
    cb(newVal, oldVal, onInvalid)
    oldVal = newVal
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (options.flush === 'post') {
        Promise.resolve().then(job)
      } else {
        job()
      }
    }
  })

  if (options.immediate) {
    job()
  } else {
    oldVal = effectFn()
  }
  
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