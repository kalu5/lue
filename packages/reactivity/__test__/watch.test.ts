import { reactive, effect, watch } from '../lib/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Watch', () => {
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
})