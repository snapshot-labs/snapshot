// import { describe, expect, it, beforeEach } from 'vitest';
// import { mount } from '@vue/test-utils';
// import TreasuryWalletsListItem from './TreasuryWalletsListItem.vue';
// import BaseAvatar from './BaseAvatar.vue';
// import BaseLink from './BaseLink.vue';
// import { shorten, explorerUrl } from '@/helpers/utils';

// const wallet = {
//   name: 'Test Wallet',
//   address: '0x0000000000000000000000000000000000000000',
//   network: 1,
//   ensAddress: 'test.eth'
// };

// describe('TreasuryWalletsListItem', () => {
//   let wrapper;
//   beforeEach(() => {
//     wrapper = mount(TreasuryWalletsListItem, {
//       props: {
//         wallet
//       },
//       stubs: {
//         BaseAvatar,
//         BaseLink
//       }
//     });
//   });

//   it('renders base avatar using wallet address', () => {
//     expect(wrapper.findComponent(BaseAvatar).props('address')).toBe(
//       wallet.address
//     );
//   });
//   it('renders wallet name', () => {
//     expect(wrapper.find('[data-testid="wallet-name"]').text()).toBe(
//       wallet.name
//     );
//   });
//   it('renders shortened wallet address', () => {
//     expect(wrapper.findComponent(BaseLink).text()).toContain(
//       shorten(wallet.address)
//     );
//   });
//   it('it renders external link pointing to explorer', () => {
//     expect(wrapper.findAllComponents(BaseLink)[1].props('link')).toBe(
//       explorerUrl(wallet.network, wallet.address)
//     );
//   });
//   it('renders wallet ens address', () => {
//     expect(wrapper.find('[data-testid="wallet-ens-address"]').text()).toBe(
//       wallet.ensAddress
//     );
//   });
//   it('doesnt render ens address when not set', async () => {
//     await wrapper.setProps({ wallet: { ...wallet, ensAddress: undefined } });
//     expect(wrapper.find('[data-testid="wallet-ens-address"]').exists()).toBe(
//       false
//     );
//   });
//   it('renders link to the wallet route', () => {
//     expect(wrapper.findAllComponents(BaseLink)[0].props('link')).toMatchObject({
//       name: 'spaceTreasury',
//       params: { wallet: wallet.address }
//     });
//   });
// });
