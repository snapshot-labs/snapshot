import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { Contract } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

const BASE_PRICE = 100;
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
    decimal: 'ether'
  },
  USDC: {
    name: 'USD Coin',
    code: 'USDC',
    decimal: 18,
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
      5: '0x73967c6a0904aa032c103b4104747e88c566b1a2'
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

export function usePayment(network: number) {
  const auth = getInstance();
  const provider = getProvider(network);
  const loading = ref(false);
  const { notify } = useFlashNotification();
  const {
    createPendingTransaction,
    updatePendingTransaction,
    removePendingTransaction
  } = useTxStatus();

  async function transfer(amount: number, currencyCode: string) {
    loading.value = true;
    const currency = CURRENCIES[currencyCode];
    const parsedAmount = parseUnits(amount.toString(), currency.decimal);
    const txPendingId = createPendingTransaction();

    try {
      let tx;
      if (currencyCode === 'ETH') {
        tx = await transferEth(parsedAmount);
      } else {
        tx = await transferErc20(parsedAmount, currency.address[network]);
      }
      updatePendingTransaction(txPendingId, { hash: tx.hash });

      const receipt = await tx.wait();

      return receipt;
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_FUNDS') {
        return notify(['red', 'Insufficient funds']);
      } else {
        console.error('Transfer error', e);
      }
    } finally {
      loading.value = false;
      removePendingTransaction(txPendingId);
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
    const contract = new Contract(address, TRANSFER_ABI, provider);
    return contract.transfer(SNAPSHOT_WALLET, amount);
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
    loading
  };
}
