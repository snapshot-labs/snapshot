import { shallowMount } from '@vue/test-utils';
import { describe, afterEach, it, expect } from 'vitest';
import TreasuryWalletsList from '@/components/TreasuryWalletsList.vue';
import i18n from '@/helpers/i18n';

describe('TreasuryWalletsList', () => {
  let wrapper;

  const findComponentWalletsBlock = () =>
    wrapper.findComponent('[data-testid="treasury-wallets-block"]');
  const findComponentWalletsMessageBlock = () =>
    wrapper.findComponent('[data-testid="treasury-wallets-message-block"]');

  function createComponent(params = {}) {
    wrapper = shallowMount(TreasuryWalletsList, {
      ...params,
      global: {
        plugins: [i18n]
      }
    });
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render wallets block when wallets is not empty', () => {
    createComponent({
      props: {
        wallets: [
          {
            address: '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f',
            name: 'Test wallet',
            network: '1'
          }
        ]
      }
    });
    expect(findComponentWalletsBlock().exists()).toBe(true);
  });

  it('should not render wallets block when wallets is empty', () => {
    createComponent({
      props: {
        wallets: []
      }
    });
    expect(findComponentWalletsBlock().exists()).toBe(false);
  });

  it('should not render message block when wallets is not empty', () => {
    createComponent({
      props: {
        wallets: [
          {
            address: '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f',
            name: 'Test wallet',
            network: '1'
          }
        ]
      }
    });
    expect(findComponentWalletsMessageBlock().exists()).toBe(false);
  });

  it('should render message block when wallets is empty', () => {
    createComponent({
      props: {
        wallets: []
      }
    });
    expect(findComponentWalletsMessageBlock().exists()).toBe(true);
  });
});
