import { describe, expect, it, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TreasuryAssetList from './TreasuryAssetList.vue';
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';
import { TreasuryAsset } from '@/helpers/interfaces';

describe('TreasuryAssetList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(TreasuryAssetList, {
      props: {
        assets: [{}, {}, {}]
      }
    });
  });

  it('renders the correct amount of list items', () => {
    expect(wrapper.findAll('li').length).toEqual(3);
  });
});
