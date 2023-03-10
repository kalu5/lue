export function createRenderer(api) {

  const { createElement, setElementText, insert } = api

  // 将vnode渲染为真实的dom节点
  function render(vnode: object, container) {
    if (vnode) {
      return patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode
    return container
  }

  function patch(oldVnode, newVnode, container) {
    if (!oldVnode) {
      return mountElement(newVnode, container)
    } else {
      patchElement(oldVnode, newVnode, container)
    }
  }

  function mountElement(vnode, container) {
    /**
     * {
     *   type: 'div',
     *   prop: {},
     *   children: []
     * }
    */
    const el = createElement(vnode.type)
    if (vnode.prop) {

    }

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else {

    }

    insert(el, container)
    return container
  }
  function patchElement(oldVnode, newVnode, container) {}

  return {
    render,
    patch
  }
}
