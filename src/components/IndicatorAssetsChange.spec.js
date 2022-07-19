import { describe, expect, it, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import IndicatorAssetsChange from './IndicatorAssetsChange.vue';

describe('IndicatorAssetsChange', () => {
  let wrapper;

  const findAssetChange = () =>
    wrapper.find('[data-testid="asset-quote-change"]');

  function createComponent(params = {}) {
    wrapper = shallowMount(IndicatorAssetsChange, params);
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render red if quote_24h is greater than quote', () => {
    createComponent({
      props: {
        quote: {
          quote: 2700,
          quote_24h: 2800
        }
      }
    });

    expect(findAssetChange().classes()).toContain('text-red');
  });

  it('should render green if quote_24h is lower than quote', async () => {
    createComponent({
      props: {
        quote: {
          quote: 2900,
          quote_24h: 2800
        }
      }
    });

    expect(findAssetChange().classes()).toContain('text-green');
  });

  it('should render correct 24h % change', () => {
    const quote = {
      quote: 2800,
      quote_24h: 2800
    };

    createComponent({
      props: {
        quote
      }
    });

    expect(
      wrapper.find('[data-testid="asset-quote-change-percent"]').text()
    ).toContain('0%');
  });

  it('should render no indicator when both are zero', () => {
    const quote = {
      quote: 0,
      quote_24h: 0
    };

    createComponent({
      props: {
        quote
      }
    });

    expect(wrapper.find('[asset-quote-change"]').exists()).toBe(false);
  });

  it('should render the change in $', async () => {
    const quote = {
      quote: 2800,
      quote_24h: 2800
    };

    createComponent({
      props: {
        quote
      }
    });

    expect(
      wrapper.find('[data-testid="asset-quote-change-usd"]').text()
    ).toContain(`$0`);
  });
});
