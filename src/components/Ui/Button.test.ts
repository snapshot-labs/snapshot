import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button.vue', () => {
  it('should slot text', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Hello world'
      },
    })
    
    expect(wrapper.text()).toContain('Hello world')
  })
})