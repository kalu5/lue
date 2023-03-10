export const platApi = {
  createElement(dom) {
    return {
      root: dom
    }
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor) {
    parent.children = el
    return parent
  }
}