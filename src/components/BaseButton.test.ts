import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from './BaseButton.vue';

describe('Button.vue', () => {
  it('should slot text', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Hello world'
      }
    });

    expect(wrapper.text()).toContain('Hello world');
  });
});
