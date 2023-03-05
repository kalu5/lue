import { reactive } from "./reactive";

export function ref (val) {
  const wrapper = {
    value: val
  }

  // 标明是ref
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return reactive(wrapper)
}

export function toRef(obj: object, key: string) {
  const wrapper = {
    get value() {
      return obj[key]
    },
    set value(newVal) {
      obj[key] = newVal
    }
  }

  // 标明是ref
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return wrapper
}

export function toRefs (obj: object) {
  let ret = {}
  for (let key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}

export function proxyRefs (obj: object) {
  return new Proxy(obj, {
    get(target, key, reciever) {
      const value = Reflect.get(target, key , reciever)
      return value.__v_isRef ? value.value : value
    },
    set(target, key, newVal, receiver) {
      const value = target[key]
      if (value.__v_isRef) {
        value.value = newVal
        return true
      }
      return Reflect.set(target, key ,newVal, receiver)
    }
  })
}