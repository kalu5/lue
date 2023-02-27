import { reactive, effect, watch } from '../lib/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Watch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  it ('监听getter', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    watch (() => obj.count, () => {
      fn()
      console.log ('改变次数')
    })
    expect(fn).toHaveBeenCalledTimes(0)
    obj.count++
    expect(fn).toHaveBeenCalledTimes(1)
    obj.count++
    obj.count++
    obj.count++
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it ('监听对象', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    watch (obj, () => {
      fn()
      console.log ('改变次数')
    })
    expect(fn).toHaveBeenCalledTimes(0)
    obj.count++
    expect(fn).toHaveBeenCalledTimes(1)
    obj.count++
    obj.count++
    obj.count++
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it ('监听对象，获取新旧值', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    let newVal
    let oldVal
    watch (() => obj.count, (newVlue, oldValue) => { 
      newVal = newVlue
      oldVal = oldValue
      fn()
      console.log ('改变次数')
    })
    expect(fn).toHaveBeenCalledTimes(0)
    obj.count++
    expect(fn).toHaveBeenCalledTimes(1)
    expect(newVal).toBe(2)
    expect(oldVal).toBe(1)
    obj.count++
    obj.count++
    obj.count++
    expect(newVal).toBe(5)
    expect(oldVal).toBe(4)
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it ('监听对象，获取新旧值,立即执行', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    let newVal
    let oldVal
    watch (() => obj.count, (newVlue, oldValue) => { 
      newVal = newVlue
      oldVal = oldValue
      fn()
      console.log ('改变次数')
    }, {
      immediate: true
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(newVal).toBe(1)
    expect(oldVal).toBe(undefined)
    obj.count++
    expect(fn).toHaveBeenCalledTimes(2)
    expect(newVal).toBe(2)
    expect(oldVal).toBe(1)
    obj.count++
    obj.count++
    obj.count++
    expect(newVal).toBe(5)
    expect(oldVal).toBe(4)
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it ('监听对象，获取新旧值,异步执行', async () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    let newVal
    let oldVal
    watch (() => obj.count, (newVlue, oldValue) => { 
      newVal = newVlue
      oldVal = oldValue
      fn()
      console.log ('改变次数')
    }, {
      flush: 'post'
    })
    obj.count++
    await vi.runAllTicks()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(newVal).toBe(2)
    expect(oldVal).toBe(1)
    obj.count++
    await vi.runAllTicks()
    expect(newVal).toBe(3)
    expect(oldVal).toBe(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it ('监听对象，获取新旧值,过期的副作用（竞态问题）', async () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const fn = vi.fn(() => {})
    let res 
    let finalRes
    watch (() => obj.count, async (newVlue, oldValue, onInvalid) => { 
      let expired = false
      onInvalid(() => {
        expired = true
      })
      fn()
      res = await 100 * newVlue
      if (!expired) {
        finalRes = res
      }
    })
    obj.count++
    await vi.runAllTicks()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(finalRes).toBe(200)
    setTimeout(() => {
      obj.count++
    }, 1000)
    await vi.runAllTimers()
    expect(finalRes).toBe(300)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})