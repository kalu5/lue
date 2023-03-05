import { ref, effect, reactive, toRefs, toRef, proxyRefs } from '../lib/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('原始值响应 ', () => {
  it ('ref', () => {
    const count = ref(1)
    let result = 0
    effect(() => {
      result = count.value
    })
    expect(result).toBe(1)
    count.value ++
    expect(result).toBe(2)
  })

  it ('响应性丢失, toRef单个解决', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    // const newObj = toRefs({...obj})
    const newObj = { count: toRef(obj, 'count') }
    let result = 0
    effect(() => {
      result = newObj.count.value
    })
    expect(result).toBe(1)
    newObj.count.value ++
    expect(result).toBe(2)
  })

  it ('响应性丢失, toRefs', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const newObj = {...toRefs(obj)}
    let result = 0
    effect(() => {
      result = newObj.count.value
    })
    expect(result).toBe(1)
    newObj.count.value ++
    expect(result).toBe(2)
  })

  it ('自动拖ref', () => {
    const data = { count: 1 }
    const obj = reactive(data)
    const newObj = proxyRefs({...toRefs(obj)})
    let result = 0
    effect(() => {
      result = newObj.count
    })
    expect(result).toBe(1)
    newObj.count ++
    expect(result).toBe(2)
  })
})