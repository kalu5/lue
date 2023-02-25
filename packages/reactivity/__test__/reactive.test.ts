import { reactive, effect } from '../lib/index'
import { describe, it, expect, vi } from 'vitest'

describe('reactive', () => {
  it ('bese reactive', () => {
    const data = { name: 'lue' }
    let result = ''
    let obj = reactive(data)
    effect(() => {
      result = obj.name
    })
    expect(result).toBe('lue')
    obj.name = 'LUE.'
    expect(result).toBe('LUE.')
    obj.name = 'LUE.....'
    expect(result).toBe('LUE.....')
  })

  it('cleanup', () => {
    const data = { name: 'lue', ok: true }
    let result = ''
    let obj = reactive(data)
    const fn = vi.fn(() => {
      result = obj.ok ? obj.name : '-'
    })
    effect(fn)
    expect(result).toBe('lue')
    // 执行次数
    expect(fn).toBeCalledTimes(1)
    obj.name = 'LUE.'
    expect(result).toBe('LUE.')
    expect(fn).toBeCalledTimes(2)
    obj.ok = false
    expect(result).toBe('-')
    expect(fn).toBeCalledTimes(3)
    obj.name = 'none'
    expect(fn).toBeCalledTimes(3)

  })

  it('嵌套effect', () => {
    const data = { foo: true, bar: true }
    let result = '';
    let result2 = '';
    let obj = reactive(data)
    const fn1 = vi.fn(() => {})
    const fn2 = vi.fn(() => {})
    effect(() => {
      fn1()
      effect(() => {
        fn2()
        result2 = obj.bar
      })
      result = obj.foo
    })
    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    obj.foo = false
    expect(fn1).toBeCalledTimes(2)
  })
})