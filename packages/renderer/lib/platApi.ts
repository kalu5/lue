// 正确设置属性 （from时，使用setAttribute, el上有的属性使用el[key]）
function   shouldSetAsProp(el, key, newProp) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
}

export const platApi = {
  createElement(dom) {
    return document.createElement(dom)
  },
  setElementText(el, text) {
    // 设置el的文本内容
    el.textContent = text
  },
  insert(el, parent, anchor) {
    // 在anchor前插入el
    parent.insertBefore(el, anchor)
   
  },
  unmount(vnode) {
    // 找到节点对应的真实dom的父节点，删除子节点
    const el = vnode.el
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el)
    }
  },
  patchProps(el, key, prevProp, newProp) {
    // 绑定事件
    if (/^on/.test(key)) {
      const event = key.slice(2).toLowerCase()
      // 存储事件
      const invokes = el._evi || (el._evi = {})
      let invoke = invokes[key]
      if (newProp) {
        if (!invoke) {
          invoke = el._evi[key] = (e) => {
            // 事件绑定时间大于时间触发时间，不执行
            // 事件触发时间
            const timeStamp = e.timeStamp
            if (timeStamp < invoke.attached) return
            if (Array.isArray(invoke.value)) {
              invoke.value.forEach(fn => fn(e))
            } else {
              invoke.value(e)
            }
          }
          invoke.value = newProp
          el.addEventListener(event, invoke)
          // 存储事件绑定时间
          invoke.attached = window.performance.now()
        } else {
          invoke.value = newProp
        }
      } else {
        if (invoke) {
          el.removeEventListener(event, invoke)
        }
      }
    }
    // 简单处理class和style，实际还需要将动态绑定的class/style处理成字符串
    if(key === 'class') {
      el.className = newProp || ''
    } else if (key === 'style') {
      el.style = newProp || ''
    } 
    // el[key]有值时使用el[key], 没有使用setAttribute
    else if (shouldSetAsProp(el, key, newProp)) {
      const type = typeof el[key]
      // 处理设置布尔值时为空传为true
      /**
       * <input disabled />
      */
      if (type === 'boolean' && newProp === '') {
        el[key] = true
      } else {
        el[key] = newProp
      }
    } else {
      el.setAttribute(key, newProp)
    }
  },
  // 创建文本
  createTextNode (text) {
    return document.createTextNode(text)
  },
  // 设置文本
  setText(el, text) {
    el.nodeValue = text
  }
}