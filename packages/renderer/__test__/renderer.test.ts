import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, effect } from '../../reactivity/lib/index'
import { createRenderer, platApi, TEXT, FRAGMENT } from "../lib";
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

  it ('更新-新节点为文本节点旧节点为一组节点', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: [
        {
          type: 'p',
          children: 'oldChild'
        }
      ]
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div><p>oldChild</p></div>')
    const newVnode = {
      type: 'div',
      children: 'newRender'
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('<div>newRender</div>')
  })


  it ('更新-新节点为文本节点', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render'
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div>render</div>')
    const newVnode = {
      type: 'div',
      children: 'newRender'
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('<div>newRender</div>')
  })

  it ('更新-新节点为一组节点', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render'
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div>render</div>')
    const newVnode = {
      type: 'div',
      children: [
        {
          type: 'p',
          children: 'childRender'
        }
      ]
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('<div><p>childRender</p></div>')
  })

  it ('文本节点', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: TEXT,
      children: 'render'
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('render')
    const newVnode = {
      type: TEXT,
      children: 'newRender'
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('newRender')
  })

  it ('fragment', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: FRAGMENT,
      children: [
        { type: 'p', children: 'p1' },
        { type: 'p', children: 'p2' },
        { type: 'p', children: 'p3' },
      ]
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<p>p1</p><p>p2</p><p>p3</p>')
    const newVnode = {
      type: FRAGMENT,
      children: [
        { type: 'p', children: 'p6' },
        { type: 'p', children: 'p7' },
        { type: 'p', children: 'p8' },
      ]
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('<p>p6</p><p>p7</p><p>p8</p>')
  })

  it ('简单diff', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: [
        { type: 'p', children: 'p1' },
        { type: 'p', children: 'p2' },
        { type: 'p', children: 'p3' },
      ]
    }
    const renderer = createRenderer(platApi)
    renderer.render(vnode, root)
    expect(root.innerHTML).toBe('<div><p>p1</p><p>p2</p><p>p3</p></div>')
    const newVnode = {
      type: 'div',
      children: [
        { type: 'p', children: 'p6' },
        { type: 'p', children: 'p7' },
        { type: 'div', children: 'p8' },
      ]
    }
    renderer.render(newVnode, root)
    expect(root.innerHTML).toBe('<div><p>p6</p><p>p7</p><div>p8</div></div>')
  })
})