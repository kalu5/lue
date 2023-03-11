import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, effect } from '../../reactivity/lib/index'
import { createRenderer, platApi } from "../lib";
import '../jsdom-config'

describe('渲染器', () => {
  // 模拟真实的dom操作
  it ('基本渲染', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render'
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div>render</div>')
    renderer.render(null, root)
    expect(root.innerHTML).toBe('')
  })

  it ('添加属性', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render',
      props: {
        id: 'app',
        class: 'root'
      }
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div id="app" class="root">render</div>')
  })

  it ('添加事件', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render',
      props: {
        id: 'child',
        class: 'child',
        onClick: function () { return 1 }
      }
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML.includes('onclick')).toBe(true)
  })
})