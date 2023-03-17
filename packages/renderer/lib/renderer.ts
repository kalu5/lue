export const TEXT = Symbol()
export const FRAGMENT = Symbol()
export function createRenderer(api) {

  const { createElement, setElementText, insert, unmount, patchProps, createTextNode, setText } = api

  // 将vnode渲染为真实的dom节点
  function render(vnode: object, container) {
    if (vnode) {
      patch(container._vnode, vnode, container, null)
    } else {
      if (container._vnode) {
        // 卸载操作
        unmount(container._vnode)
      }
    }
    
    container._vnode = vnode

  }

  function patch(oldVnode, newVnode, container, anchor) {
    // 新旧节点类型不一样还是需要卸载后重新挂载
    // 新旧节点类型相同才能找到可复用的节点进行复用，提升性能
    if (oldVnode && oldVnode.type !== newVnode.type) {
      unmount(oldVnode)
      oldVnode = null
    }

    const { type } = newVnode
    // 标签元素
    if (typeof type === 'string') {
      if (!oldVnode) {
        mountElement(newVnode, container, anchor)
      } else {
        patchElement(oldVnode, newVnode, container)
      }
    } 
    // 组件
    else if (typeof type === 'object') {

    }
    // 文本节点
    else if (type === TEXT) {
      if (!oldVnode) {
        const el = newVnode.el = createTextNode(newVnode.children)
        insert(el, container)
      } else {
        // 新文本内容更新旧文本内容
        const el = newVnode.el = oldVnode.el
        if (newVnode.children !== oldVnode.children) {
          setText(el, newVnode.children)
        }
      }
    }
    // Fragment
    else if (type === FRAGMENT) {
      if (!oldVnode) {
        newVnode.children.forEach(child => patch(null, child, container, anchor))
      } else {
        patchChildren(oldVnode, newVnode, container)
      }
    }
    
  }

  function mountElement(vnode, container, anchor) {
    /**
     * {
     *   type: 'div',
     *   props: {},
     *   children: []
     * }
    */
    const el = vnode.el = createElement(vnode.type)
    if (vnode.props) {
      // 处理prop
      for (let key in vnode.props) {
        //                  oldValue newValue
        patchProps(el, key, null, vnode.props[key])
      }
    }

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      // 数组，遍历patch
      vnode.children.forEach(child => {
        patch(null, child, el, anchor)
      })
    }

    insert(el, container, anchor)
  }
  function patchElement(oldVnode, newVnode, container) {
    const el = newVnode.el = oldVnode.el;

    const oldProps = oldVnode.props
    const newProps = newVnode.props
    // 更新props
    for (let key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    // 删除旧的props
    for (let key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }

    // 更新子节点
    patchChildren(oldVnode, newVnode, el)
  }

  function patchChildren(oldVnode, newVnode, el) {
    if ( typeof newVnode.children === 'string') {
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(child => {
          unmount(child)
        })
      }
      setElementText(el, newVnode.children)
    } else if (Array.isArray(newVnode.children)) {
      if (Array.isArray(oldVnode.children)) {
        // diff算法
        // simpleDiff(oldVnode, newVnode, el)
        // doubleDiff(oldVnode, newVnode, el)
        quickDiff(oldVnode, newVnode, el)
      }
      setElementText(el, '')
      newVnode.children.forEach(child => {
        patch(null, child,el, null)
      })
    } else {
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(child => {
          unmount(child)
        })
      } else if (typeof oldVnode.children === 'string') {
        setElementText(el, '')
      }
    }
  }

  // 简单diff
  function simpleDiff(n1, n2, el) {
    // 遍历新节点children
    let maxIndex // 存储最大的索引
    n2.children.forEach((n2Child, n2Index) => {
      // 是否找到了可复用的节点
      let isFind = false;
      maxIndex = n2Index
      try {
        n1.children.forEach((n1Child, n1Index) => {
          if (n2Child.key === n1Child.key) {
            isFind = true;
            // 可复用也需要patch，内容可能不一样
            patch(n1Child, n2Child,el, null)
            // 找到可复用节点后，当前index大于maxIndex需要移动dom
            if (n1Index > maxIndex) {
              const prevVnode = n2.children[n2Index - 1]
              if (prevVnode) {
                const prevEl = prevVnode.el.nextSibling
                // 移动dom
                insert(n2Child.el, el, prevEl)
              }
            } else {
              maxIndex = n1Index
            }
            throw new Error('break')
          }
        })
  
      } catch(e) {
        
      }
      
      // 没有找到说明是新节点需要挂载
      if (!isFind) {
        let anchor
        const prevVnode = n2.children[n2Index - 1]
        if (prevVnode) {
          anchor = prevVnode.el.nextSibling
        } else {
          anchor = el.firstChild
        }
        // 挂载
        patch(null, n2Child, el, anchor)
      }
    })

    // 遍历旧节点看是否有要移除的旧节点
    n1.children.forEach((n1Child) => {
      let hasChild = n2.children.find(n2Child => n1Child.key === n2Child.key)
      if (!hasChild) {
        unmount(n1Child)
      }
    })
  }

  // 双端diff 减少Dom移动次数
  function doubleDiff(n1, n2, el) {
    const n1Child = n1.children
    const n2Child = n2.children
    // 定义索引
    let startN1Index = 0,
        endN1Index = n1Child.length - 1,
        startN2Index = 0,
        endN2Index = n2Child.length - 1;
    // 定义索引对应的节点
    let startN1Vnode = n1Child[startN1Index],
        endN1Vnode = n1Child[endN1Index],
        startN2Vnode = n2Child[startN2Index],
        endN2Vnode = n2Child[endN2Index];

    // 遍历寻找可复用节点
    while(startN1Index <= endN1Index && startN2Index <= endN2Index) {
      if (!startN1Vnode) {
        startN1Vnode = n1Child[++startN1Index]
      } else if (!endN1Vnode) {
        endN1Vnode = n1Child[--endN1Index]
      } else if (startN1Vnode.key === startN2Vnode.key) {
        patch(startN1Vnode, startN2Vnode, el, null)
        startN1Vnode = n1Child[++startN1Index]
        startN2Vnode = n2Child[++startN2Index]
      } else if (endN1Vnode.key === endN2Vnode.key) {
        patch(endN1Vnode, endN2Vnode, el, null)
        endN1Vnode = n1Child[--endN1Index]
        endN2Vnode = n2Child[--endN2Index]
      } else if (startN1Vnode.key === endN2Vnode.key) {
        patch(startN1Vnode, endN2Vnode, el, null)
        // 将旧节点开始节点对应的真实dom移动到旧节点最后节点对应的真实dom后
        insert(startN1Vnode.el, el, endN1Vnode.el.nextSibling)
        startN1Vnode = n1Child[++startN1Index]
        endN2Vnode = n2Child[--endN2Index]
      } else if (endN1Vnode.key === startN2Vnode.key) {
        patch(endN1Vnode, startN2Vnode, el, null)
        // 将旧节点结束节点对应的真实dom移动到旧节点开始节点对应的真实dom前
        insert(endN1Vnode.el, el, startN1Vnode.el)
        endN1Vnode = n1Child[--endN1Index]
        startN2Vnode = n2Child[++startN2Index]
      } else {
        // 都没有找到可复用节点
        const n1Index = n1Child.find(child => child.key === startN2Vnode.key)
        if (n1Index !== -1) {
          let n1Vnode = n1Child[n1Index]
          patch(n1Vnode, startN2Vnode, el, null)
          insert(n1Vnode.el, el, startN1Vnode.el)
          n1Vnode = undefined
          
        } else {
          // 新增
          patch(null, startN2Vnode, el, startN1Vnode.el)
        }
        startN2Vnode = n2Child[++startN2Index]
      }
    }

    // 检查index
    if (startN1Index > endN1Index && startN2Index <= endN2Index) {
      // 新增
      for(let i = startN2Index; i <= endN2Index; i++) {
        //当前的头部节点
        const anchor = n2Child[endN2Index + 1] ? n2Child[endN2Index + 1].el : null
        patch(null, n2Child[i], el, anchor)
      }
    } else if (startN2Index > endN2Index && startN1Index <= endN1Index) {
      // 卸载
      for(let i = startN1Index; i <= endN1Index; i++) {
        unmount(n1Child[i])
      }
    }

  }

  // 快速diff 
  function quickDiff(n1, n2, el) {
    // 预处理 首尾寻找可复用节点
    const n1Child = n1.children
    const n2Child = n2.children
    let j = 0;
    let oldVnode = n1Child[j]
    let newVnode = n2Child[j]
    while(oldVnode.key === newVnode.key) {
      patch(oldVnode, newVnode, el, null)
      j++
      oldVnode = n1Child[j]
      newVnode = n2Child[j]
    }

    let oldEndIndex = n1Child.length - 1
    let newEndIndex = n2Child.length - 1
    oldVnode = n1Child[oldEndIndex]
    newVnode = n2Child[newEndIndex]
    while(oldVnode.key === newVnode.key) {
      patch(oldVnode, newVnode, el, null)
      oldEndIndex --
      newEndIndex --
      oldVnode = n1Child[oldEndIndex]
      newVnode = n2Child[newEndIndex]
    }

    // 添加和删除
    if(j > oldEndIndex && j <= newEndIndex) {
      const anchorIndex = newEndIndex + 1
      const anchor = anchorIndex < n2Child.length ? n2Child[anchorIndex].el : null
      while(j <= newEndIndex) {
        patch(null, n2Child[j++], el, anchor)
      }
    } else if ( j <= oldEndIndex && j > newEndIndex ) {
      while(j <= oldEndIndex) {
        unmount(n1Child[j++])
      }
    } else {
      // 处理非理想情况
      // 未处理的节点
      const count = newEndIndex - j + 1
      // 定义数组存储未处理节点在旧节点中的索引
      const source = new Array(count)
      source.fill(-1)

      // 填充
      const oldStartIndex = j
      const newStartIndex = j

      // 新节点索引表
      let keyIndex = {}
      for(let i = newStartIndex; i <= newEndIndex; i++) {
        keyIndex[n2Child[i].key] = i
      }

      // 移动dom
      let move = false
      let pos = 0
      // 更新过的节点
      let patched = 0

      // 在旧的节点中找到复用节点并填充数组
      for(let k = oldStartIndex; k <= oldEndIndex; k++) {
        oldVnode = n1Child[k]
        // 如果更新过的节点大于将要更新的节点，需要卸载
        if (patched <= count) {
          const hasKey = keyIndex[oldVnode.key]
          if (typeof hasKey != 'undefined') {
            // 找到相同key
            newVnode = n2Child[hasKey]
            patch(oldVnode, newVnode, el, null)
            source[hasKey - newStartIndex] = k
  
            // 判断是否需要移动
            if (k < pos) {
              move = true
            } else {
              pos = k
            }
          } else {
            // 卸载
            unmount(oldVnode)
          }
        } else {
          unmount(oldVnode)
        }
       
      }

      // 移动dom
      if (move) {
        // 计算最长递增子序列
        // 对未处理的节点重新排序，在递增子序列中的索引所对应的dom不需要移动
        let seq = lis(source)
        let s = seq.length - 1
        let i = count - 1
        for (i; i >= 0 ; i--) {
          if (source[i] === -1) {
            // 新节点需要挂载
            const pos = newStartIndex + i
            const newVnode = n2Child[pos]
            const nextPos = pos + 1
            const anchor = nextPos < n2Child.length ? n2Child[nextPos].el : null
            patch(null ,newVnode, el, anchor)
          } else if (i !== seq[s]) {
            // 需要移动
            const pos = newStartIndex + i
            const newVnode = n2Child[pos]
            const nextPos = pos + 1
            const anchor = nextPos < n2Child.length ? n2Child[nextPos].el : null
            insert(newVnode.el ,el, anchor)
          } else {
            // 不需要移动
            s--
          }
        }
      }

    }
  }

  return {
    render,
    patch
  }
}

// 计算最长递增子序列
function lis(arr) {
  const p = arr.slice
  const result = [0]
  let j , i, u, v,c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[ u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[ u - 1]
  while(u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
