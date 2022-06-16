import { mount, RouterLinkStub } from '@vue/test-utils';
import { describe, afterEach, it, expect } from 'vitest';
import TreasuryWalletsListItem from '@/components/TreasuryWalletsListItem.vue';
import AvatarUser from './AvatarUser.vue';
import BaseLink from './BaseLink.vue';
import { shorten, explorerUrl } from '@/helpers/utils';

describe('TreasuryWalletsListItem', () => {
  let wrapper;

  const findWalletName = () => wrapper.find('[data-testid="wallet-name"]');
  const findWalletEnsAddress = () =>
    wrapper.find('[data-testid="wallet-ens-address"]');
  const findComponentBaseAvatar = () => wrapper.findComponent(AvatarUser);
  const findComponentBaseLinkOne = () => wrapper.findAllComponents(BaseLink)[0];
  const findComponentBaseLinkTwo = () => wrapper.findAllComponents(BaseLink)[1];

  const wallet = {
    name: 'Test Wallet',
    address: '0x0000000000000000000000000000000000000000',
    network: 1
  };

  function createComponent(params = {}) {
    wrapper = mount(TreasuryWalletsListItem, {
      ...params,
      global: {
        stubs: { AvatarUser, BaseLink, RouterLink: RouterLinkStub }
      },
      props: {
        wallet,
        ensAddress: 'test.eth'
      }
    });
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render base avatar using wallet address', () => {
    createComponent();

    expect(findComponentBaseAvatar().props('address')).toBe(wallet.address);
  });

  it('should render wallet name', () => {
    createComponent();

    expect(findWalletName().text()).toBe(wallet.name);
  });

  it('should render shortened wallet address', () => {
    createComponent();

    expect(findComponentBaseLinkOne().text()).toContain(
      shorten(wallet.address)
    );
  });

  it('should render external link pointing to explorer', () => {
    createComponent();

    expect(findComponentBaseLinkTwo().props('link')).toBe(
      explorerUrl(wallet.network, wallet.address)
    );
  });

  it('should render wallet ens address', () => {
    createComponent();

    expect(findWalletEnsAddress().text()).toBe('test.eth');
  });

  it('should not render ens address when not set', async () => {
    createComponent();

    await wrapper.setProps({ ensAddress: undefined });
    expect(findWalletEnsAddress().exists()).toBe(false);
  });

  it('should render link to the wallet route', () => {
    createComponent();

    expect(findComponentBaseLinkOne().props('link')).toMatchObject({
      name: 'spaceTreasury',
      params: { wallet: wallet.address }
    });
  });
});
