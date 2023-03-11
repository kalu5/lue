export const platApi = {
  createElement(dom) {
    return document.createElement(dom)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor) {
    parent.insertBefore(el, anchor)
   
  },
  unmount(vnode) {
    const el = vnode.el
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el)
    }
  }
}