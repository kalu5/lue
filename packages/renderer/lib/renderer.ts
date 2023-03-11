export function createRenderer(api) {

  const { createElement, setElementText, insert, unmount, patchProps } = api

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
    if (!oldVnode) {
      mountElement(newVnode, container)
    } else {
      patchElement(oldVnode, newVnode, container)
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
  function patchElement(oldVnode, newVnode, container) {}

  return {
    render,
    patch
  }
}
