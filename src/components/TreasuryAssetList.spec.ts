import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import TreasuryAssetList from './TreasuryAssetList.vue';
import i18n from '@/helpers/i18n';

describe('TreasuryAssetList', () => {
  let wrapper;

  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  beforeEach(() => {
    wrapper = shallowMount(TreasuryAssetList, {
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
