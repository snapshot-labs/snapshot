import { describe, expect, it, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import IndicatorAssetsChange from './IndicatorAssetsChange.vue';
import { useIntl } from '@/composables/useIntl';

const { formatPercentNumber, formatNumber } = useIntl();

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

  it('should render green if quote_24h is equal to quote', async () => {
    createComponent({
      props: {
        quote: {
          quote: 2800,
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
    ).toContain(
      `${quote.quote_24h > quote.quote ? '' : '+'}${formatPercentNumber(
        (quote.quote - quote.quote_24h) / quote.quote_24h
      )}`
    );
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
    ).toContain(`($${formatNumber(quote.quote - quote.quote_24h)})`);
  });
});
