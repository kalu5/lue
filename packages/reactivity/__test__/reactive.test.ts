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
})