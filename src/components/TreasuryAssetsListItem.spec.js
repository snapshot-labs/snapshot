import { shallowMount } from '@vue/test-utils';
import { describe, afterEach, it, expect } from 'vitest';
import TreasuryAssetsListItem from '@/components/TreasuryAssetsListItem.vue';
import { useIntl } from '@/composables/useIntl';
import { formatUnits } from '@ethersproject/units';

const { formatCompactNumber, formatNumber } = useIntl();

describe('TreasuryAssetsListItem', () => {
  let wrapper;

  const findAssetLogo = () => wrapper.find('[alt="Asset logo"]');
  const findAssetName = () => wrapper.find('[data-testid="asset-name"]');
  const findAssetBalance = () => wrapper.find('[data-testid="asset-balance"]');
  const findAssetSymbol = () => wrapper.find('[data-testid="asset-symbol"]');
  const findAssetQuote = () => wrapper.find('[data-testid="asset-quote"]');

  const asset = {
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

  function createComponent(params = {}) {
    wrapper = shallowMount(TreasuryAssetsListItem, {
      ...params,
      props: { asset }
    });
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render the correct img url', () => {
    createComponent();

    expect(findAssetLogo().attributes('src')).toEqual(asset.logo_url);
  });

  it('should render the correct name', () => {
    createComponent();

    expect(findAssetName().text()).toContain(asset.contract_name);
  });

  it('should render the correct asset balance', () => {
    createComponent();

    expect(findAssetBalance().text()).toContain(
      formatCompactNumber(
        Number(formatUnits(asset.balance, asset.contract_decimals))
      )
    );
  });

  it('should render the correct asset symbol', () => {
    createComponent();

    expect(findAssetSymbol().text()).toContain(asset.contract_ticker_symbol);
  });

  it('should render the correct quote', () => {
    createComponent();

    expect(findAssetQuote().text()).toContain(`$${formatNumber(asset.quote)}`);
  });
});
