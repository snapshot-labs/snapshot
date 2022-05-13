import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TreasuryAssetListItem from './TreasuryAssetListItem.vue';
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';
import { AssetInfo } from '@/helpers/interfaces';

const { formatCompactNumber, formatNumber, formatPercentNumber } = useIntl();

const item: AssetInfo = {
  contract_name: 'Wrapped Ether',
  contract_ticker_symbol: 'WETH',
  contract_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  contract_decimals: 18,
  logo_url: 'https://logos.covalenthq.com/',
  balance: '12000045317566025999',
  balance_24h: '12000045317566025999',
  quote: 2700,
  quote_24h: 2800
};

describe('TreasuryAssetListItem', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(TreasuryAssetListItem, {
      props: {
        item
      }
    });
  });

  it('renders the correct img size and url', () => {
    const img = wrapper.find('[alt="Asset logo"]');
    expect(img.classes()).toContain('h-6');
    expect(img.classes()).toContain('w-6');
    expect(img.attributes('src')).toEqual(item.logo_url);
  });
  it('renders the correct name', () => {
    expect(wrapper.text()).toContain(item.contract_name);
  });
  it('renders the correct asset balance', () => {
    expect(wrapper.text()).toContain(
      formatCompactNumber(
        Number(formatUnits(item.balance, item.contract_decimals))
      )
    );
  });
  it('renders the correct asset symbol', () => {
    expect(wrapper.text()).toContain(item.contract_ticker_symbol);
  });
  it('renders the correct quote', () => {
    expect(wrapper.text()).toContain(`$${formatNumber(item.quote)}`);
  });
  it('shows correct 24h % change', () => {
    expect(wrapper.text()).toContain(
      `${item.quote_24h > item.quote ? '' : '+'}${formatPercentNumber(
        (item.quote - item.quote_24h) / item.quote_24h
      )}`
    );
  });
  it('shows red if 24h is higher than quote', async () => {
    expect(wrapper.find('[id="quote-change"]').classes()).toContain('text-red');
  });
  it('shows green if 24h is lower than quote', async () => {
    await wrapper.setProps({
      item: {
        ...item,
        quote: item.quote + 200,
        quote_24h: item.quote_24h
      }
    });
    expect(wrapper.find('[id="quote-change"]').classes()).toContain(
      'text-green'
    );
  });
  it('shows green if 24h is equal to quote', async () => {
    await wrapper.setProps({
      item: {
        ...item,
        quote: item.quote + 100,
        quote_24h: item.quote_24h
      }
    });
    expect(wrapper.find('[id="quote-change"]').classes()).toContain(
      'text-green'
    );
  });
});
