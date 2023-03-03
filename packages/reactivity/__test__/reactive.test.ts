import { reactive, effect, shallowReactive } from '../lib/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('reactive', () => {
  beforeEach(() => {
    // 使用假时间
    vi.useFakeTimers()
  })
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

  it('schedule', async () => {
    const data = { count: 1 }
    let arr1: (string | number) [] = [];
    let arr2: (string | number) [] = []
    let obj = reactive(data)
    effect(() => {
      arr1.push(obj.count)
    })
    effect(() => {
      arr2.push(obj.count)
    }, {
      scheduler(fn) {
        // 控制副作用的执行时机
        setTimeout(fn)
      }
    })
    obj.count++
    arr1.push('end')
    arr2.push('end')
    // 结束定时器
    await vi.runAllTimers()
    expect(arr1).toEqual([1, 2, 'end'])
    expect(arr2).toEqual([1, 'end', 2])
  })

  it('schedule配合微任务优化，多次更改，只执行一次', async () => {
    const data = { count: 1 }
    let obj = reactive(data)

    const jobQueue = new Set()
    const p = Promise.resolve()
    let isFlushing = false
    function flushJob () {
      if (isFlushing) return 
      isFlushing = true
      p.then(() => {
        jobQueue.forEach(job => job())
      }).finally(()=> {
        isFlushing = false
      })
    }

    let fnOb = {
      count(n) {
        console.log (n)
        return n
      }
    }

    let fn = vi.spyOn(fnOb, 'count')
    effect(() => {
      fnOb.count(obj.count)
    }, {
      scheduler(fn) {
        jobQueue.add(fn)
        flushJob()
      }
    })
    obj.count ++
    obj.count ++
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
    await vi.runAllTicks()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(3)
  })

  it('Reflect', async () => {
    const data = {
      count: 1,
      get total() {
        // this指向原始对象使用Refelct指向代理对象
        return this.count + 2
      }
    }
    let obj = reactive(data)
    let result = ''
    effect(() => {
      result = obj.total
    })
    expect(result).toBe(3)
    obj.count ++
    expect(result).toBe(4)
  })

  it('嵌套响应', async () => {
    const data = {
      count: 1,
      child: {
        count: 11
      }
    }
    let obj = reactive(data)
    let result 
    effect(() => {
      result = obj.child.count
    })
    expect(result).toBe(11)
    obj.child.count ++
    expect(result).toBe(12)
  })

  it('浅响应', async () => {
    const data = {
      count: 1,
      child: {
        count: 11
      }
    }
    let obj = shallowReactive(data)
    let result 
    effect(() => {
      result = obj.child.count
    })
    expect(result).toBe(11)
    obj.child.count ++
    expect(result).toBe(11)
  })

  it('遍历对象/添加/修改', () => {
    const data = { count: 1, total: 10 }
    let obj = reactive(data)
    const fn = vi.fn((...args) => {})
    const fn2 = vi.fn((...args) => {})
    effect(() => {
      for(let key in obj) {
        console.log (key)
        fn()
      }
    })
    effect(() => {
      fn2(obj.total)
    })
    expect(fn).toBeCalledTimes(2)
    obj.count = 7
    expect(fn).toHaveBeenCalledTimes(2)
    obj.amaze = 9
    expect(fn).toHaveBeenCalledTimes(5)
    delete obj.amaze
    expect(fn).toBeCalledTimes(7)
    
    expect(fn2).toBeCalledTimes(1)
    obj.total++
    expect(fn2).toBeCalledTimes(2)
    obj.total = 9
    expect(fn2).toBeCalledTimes(3)
  })

  it('删除对象', () => {
    const data = {
      count: 1,
      total: 10
    }
    const obj = reactive(data)
    const fn = vi.fn((...args) => {})
    effect(() => {
      fn(obj.count)
    })
    expect(fn).toBeCalledTimes(1)
    delete obj.count 
    expect(fn).toBeCalledTimes(2)
  })
})