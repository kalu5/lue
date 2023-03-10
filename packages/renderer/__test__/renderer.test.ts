import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, effect } from '../../reactivity/lib/index'
import { createRenderer, platApi } from "../lib";

describe('渲染器', () => {
  // 模拟真实的dom操作
  it ('基本渲染', () => {
    const root = platApi.createElement('div')
    const vnode = {
      type: 'div',
      children: 'render'
    }
    const renderer = createRenderer(platApi)
    const result = renderer.render(vnode, root)
    expect(result).toEqual({
      'root': 'div',
      children: {
        root: 'div',
        textContent: 'render'
      }
    })
  })
})