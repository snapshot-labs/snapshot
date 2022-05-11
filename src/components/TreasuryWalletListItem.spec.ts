import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TreasuryWalletListItem from './TreasuryWalletListItem.vue';
import { formatUnits } from '@ethersproject/units';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

const item = {
  contract_ticker_symbol: 'WETH',
  logo_url: 'https://logos.covalenthq.com/',
  contract_decimals: 18,
  balance: '12000045317566025999',
  quote: 28183.89
};

describe('TreasuryWalletListItem', () => {
  const wrapper = mount(TreasuryWalletListItem, {
    props: {
      item
    }
  });
  it('renders the correct img size and url', () => {
    expect(wrapper.find('img').classes()).toContain('h-6');
    expect(wrapper.find('img').classes()).toContain('w-6');
    expect(wrapper.find('img').attributes('src')).toEqual(item.logo_url);
  });
  it('renders the correct ticker symbol', () => {
    expect(wrapper.text()).toContain(item.contract_ticker_symbol);
  });
  it('renders the correct balance', () => {
    expect(wrapper.text()).toContain(
      formatCompactNumber(
        Number(formatUnits(item.balance, item.contract_decimals))
      )
    );
  });
  it('renders the correct balance in usd', () => {
    expect(wrapper.text()).toContain(`$${formatCompactNumber(item.quote)}`);
  });
});
