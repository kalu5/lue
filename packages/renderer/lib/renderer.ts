export const TEXT = Symbol()
export function createRenderer(api) {

  const { createElement, setElementText, insert, unmount, patchProps, createTextNode, setText } = api

  // 将vnode渲染为真实的dom节点
  function render(vnode: object, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 卸载操作
        unmount(container._vnode)
      }
    }
    
    container._vnode = vnode

  }

  function patch(oldVnode, newVnode, container) {
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
        mountElement(newVnode, container)
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
    
  }

  function mountElement(vnode, container) {
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
        patch(null, child, el)
      })
    }

    insert(el, container)
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
      }
      setElementText(el, '')
      newVnode.children.forEach(child => {
        patch(null, child,el)
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

  return {
    render,
    patch
  }
}
