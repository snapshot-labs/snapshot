// import { describe, expect, it, beforeEach } from 'vitest';
// import { mount } from '@vue/test-utils';
// import TreasuryAssetsListItem from './TreasuryAssetsListItem.vue';
// import { formatUnits } from '@ethersproject/units';
// import { useIntl } from '@/composables/useIntl';

// const { formatCompactNumber, formatNumber } = useIntl();

// const asset = {
//   contract_name: 'Wrapped Ether',
//   contract_ticker_symbol: 'WETH',
//   contract_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
//   contract_decimals: 18,
//   logo_url: 'https://logos.covalenthq.com/',
//   balance: '12000045317566025999',
//   balance_24h: '12000045317566025999',
//   quote: 2700,
//   quote_24h: 2800
// };

// describe('TreasuryAssetsListItem', () => {
//   let wrapper;
//   beforeEach(() => {
//     wrapper = mount(TreasuryAssetsListItem, {
//       props: {
//         asset
//       }
//     });
//   });

//   it('renders the correct img url', () => {
//     const img = wrapper.find('[alt="Asset logo"]');
//     expect(img.attributes('src')).toEqual(asset.logo_url);
//   });
//   it('renders the correct name', () => {
//     expect(wrapper.text()).toContain(asset.contract_name);
//   });
//   it('renders the correct asset balance', () => {
//     expect(wrapper.text()).toContain(
//       formatCompactNumber(
//         Number(formatUnits(asset.balance, asset.contract_decimals))
//       )
//     );
//   });
//   it('renders the correct asset symbol', () => {
//     expect(wrapper.text()).toContain(asset.contract_ticker_symbol);
//   });
//   it('renders the correct quote', () => {
//     expect(wrapper.text()).toContain(`$${formatNumber(asset.quote)}`);
//   });
// });
