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
        simpleDiff(oldVnode, newVnode, el)
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

  return {
    render,
    patch
  }
}
