import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import TreasuryAssetsList from './TreasuryAssetsList.vue';
import i18n from '@/helpers/i18n';

describe('TreasuryAssetsList', () => {
  let wrapper;

  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  beforeEach(() => {
    wrapper = shallowMount(TreasuryAssetsList, {
      global: {
        plugins: [i18n]
      },
      props: {
        assets: [{}, {}, {}]
      }
    });
  });
  it('renders the correct amount of assets', () => {
    expect(wrapper.findAll('li').length).toEqual(3);
  });

  // TODO: Nessecary to title, counter and label?
});
