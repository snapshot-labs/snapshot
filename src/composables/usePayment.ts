import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

const BASE_PRICE = 1;
const BASE_CURRENCY = {
  name: 'USD',
  symbol: '$'
};

const PLANS = [
  { label: '1 year', factor: 12, discount: 20 },
  { label: '6 months', factor: 6 },
  { label: '3 months', factor: 3 }
];
const CURRENCIES = {
  ETH: {
    name: 'Ethereum',
    code: 'ETH',
    decimal: 18
  },
  USDC: {
    name: 'USD Coin',
    code: 'USDC',
    decimal: 6,
    address: {
      1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      5: '0x07865c6e87b9f70255377e024ace6630c1eaa37f'
    }
  },
  DAI: {
    name: 'DAI',
    code: 'DAI',
    decimal: 18,
    address: {
      1: '0x6b175474e89094c44da98b954eedeac495271d0f',
      5: '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60'
    }
  }
};
const DEFAULT_CURRENCY = 'ETH';
const DEFAULT_PLAN = PLANS[0];
const TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        type: 'uint256',
        name: '_tokens'
      }
    ],
    constant: false,
    outputs: [],
    payable: false
  }
];
const SNAPSHOT_WALLET = '0x91FD2c8d24767db4Ece7069AA27832ffaf8590f3';
const fxRates = reactive({
  ETH: 0.000424,
  USDC: 1,
  DAI: 1
});
const paymentTx = ref(null);

export function usePayment(network: number) {
  const auth = getInstance();
  const loading = ref(false);
  const { notify } = useFlashNotification();

  async function transfer(amount: number, currencyCode: string) {
    loading.value = true;
    const currency = CURRENCIES[currencyCode];

    try {
      const parsedAmount = parseUnits(
        amount.toFixed(currency.decimal),
        currency.decimal
      );
      let tx;

      if (currencyCode === 'ETH') {
        tx = await transferEth(parsedAmount);
      } else {
        tx = await transferErc20(parsedAmount, currency.address[network]);
      }
      paymentTx.value = { network, ...tx };
      loading.value = false;

      return await tx.wait();
    } catch (e: any) {
      loading.value = false;

      if (e.code === 'INSUFFICIENT_FUNDS') {
        return notify(['red', 'Insufficient funds']);
      } else {
        console.error('Transfer error', e);
      }
    }
  }

  async function transferEth(amount: BigNumber) {
    const signer = auth.web3.getSigner();
    return signer.sendTransaction({
      to: SNAPSHOT_WALLET,
      value: amount
    });
  }

  async function transferErc20(amount: BigNumber, address: string) {
    return sendTransaction(auth.web3, address, TRANSFER_ABI, 'transfer', [
      SNAPSHOT_WALLET,
      amount
    ]);
  }

  return {
    BASE_PRICE,
    BASE_CURRENCY,
    DEFAULT_CURRENCY,
    DEFAULT_PLAN,
    CURRENCIES,
    PLANS,
    transfer,
    fxRates,
    loading,
    paymentTx
  };
}