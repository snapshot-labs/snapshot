// import { describe, expect, it, beforeEach } from 'vitest';
// import { mount } from '@vue/test-utils';
// import IndicatorAssetsChange from './IndicatorAssetsChange.vue';
// import { useIntl } from '@/composables/useIntl';

// const { formatPercentNumber, formatNumber } = useIntl();

// const quote = {
//   quote: 2700.1111,
//   quote_24h: 2800.1111
// };

// describe('IndicatorAssetsChange', () => {
//   let wrapper;
//   beforeEach(() => {
//     wrapper = mount(IndicatorAssetsChange, {
//       props: {
//         quote
//       }
//     });
//   });

//   it('shows red if 24h is higher than quote', async () => {
//     expect(
//       wrapper.find('[data-testid="asset-quote-change"]').classes()
//     ).toContain('text-red');
//   });
//   it('shows green if 24h is lower than quote', async () => {
//     await wrapper.setProps({
//       quote: {
//         quote: quote.quote + 200,
//         quote_24h: quote.quote_24h
//       }
//     });
//     expect(
//       wrapper.find('[data-testid="asset-quote-change"]').classes()
//     ).toContain('text-green');
//   });
//   it('shows green if 24h is equal to quote', async () => {
//     await wrapper.setProps({
//       quote: {
//         quote: quote.quote + 100,
//         quote_24h: quote.quote_24h
//       }
//     });
//     expect(
//       wrapper.find('[data-testid="asset-quote-change"]').classes()
//     ).toContain('text-green');
//   });
//   it('shows correct 24h % change', () => {
//     expect(
//       wrapper.find('[data-testid="asset-quote-change-percent"]').text()
//     ).toContain(
//       `${quote.quote_24h > quote.quote ? '' : '+'}${formatPercentNumber(
//         (quote.quote - quote.quote_24h) / quote.quote_24h
//       )}`
//     );
//   });
//   it('shows the change in $', async () => {
//     expect(
//       wrapper.find('[data-testid="asset-quote-change-usd"]').text()
//     ).toContain(`($${formatNumber(quote.quote - quote.quote_24h)})`);
//   });
// });
