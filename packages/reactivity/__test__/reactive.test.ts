import { reactive, effect } from '../lib/index'
import { describe, it, expect } from 'vitest'

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
})