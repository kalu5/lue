import { reactive, effect, computed } from '../lib/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('计算属性和懒执行', () => {
  it ('lazy', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn((...args) => {})
    const effectFn = effect(() => {
      fn(obj.count)
    }, {
      lazy: true
    })
    expect(fn).toBeCalledTimes(0)
    effectFn()
    expect(fn).toBeCalledTimes(1)
  })

  it ('computed', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    const counter = computed(() => {
      fn()
      return obj.count*2
    })
    expect(fn).toBeCalledTimes(0)
    expect(counter.value).toBe(2)
    expect(fn).toBeCalledTimes(1)
    obj.count ++
    expect(counter.value).toBe(4)
    console.log (counter.value)
    console.log (counter.value)
    console.log (counter.value)
    expect(fn).toBeCalledTimes(2)

  })

  it ('在副作用函数中读取computed的值', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn((...arg) => {})
    const counter = computed(() => {
      return obj.count*2
    })

    effect(() => {
      fn(counter.value)
    })
    expect(fn).toBeCalledTimes(1)
    obj.count ++
    expect(fn).toBeCalledTimes(2)
  })
})