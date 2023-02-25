import { getActiveEffect } from "./effect"

const bucket = new Set()

export function reactive(obj: object) {
  return new Proxy(obj, {
    get(target, key) {
      bucket.add(getActiveEffect())
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      bucket && bucket.forEach(fn => fn())
      return true
    }
  })
}