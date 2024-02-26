import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

const BASE_PRICE = 2000;
const BASE_UNIT = 1;
const BASE_CURRENCY = {
  symbol: '$'
};

const PLANS = {
  y1: { label: '1 year', unit: 12, discount: 16.667 },
  m6: { label: '6 months', unit: 6, discount: 0 }
};
const CURRENCIES = {
  ethereum: {
    name: 'Ethereum',
    code: 'ETH',
    decimal: 18,
    logo: 'ipfs://bafybeieaiuehxdqgmdgxfl7addolzht3x5qnyhk4epn5f7yko7h4egpsvi',
    address: {
      1: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      5: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    }
  },
  'usd-coin': {
    name: 'USD Coin',
    code: 'USDC',
    decimal: 6,
    address: {
      1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      5: '0x07865c6e87b9f70255377e024ace6630c1eaa37f'
    },
    logo: 'ipfs://bafybeiffspz4hsyc5drzf5ioum2x535dxmvfmt3342g4iizbinie7cpehy'
  },
  dai: {
    name: 'DAI',
    code: 'DAI',
    decimal: 18,
    address: {
      1: '0x6b175474e89094c44da98b954eedeac495271d0f',
      5: '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60'
    },
    logo: 'ipfs://bafkreib3ujd27dovs3aqezrttibnspkprplyb7nf6wzm2vgjohleajkg4q'
  }
};
const DEFAULT_CURRENCY = 'ethereum';
const DEFAULT_PLAN = 'y1';
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
const SNAPSHOT_WALLET = '0x01e8CEC73B020AB9f822fD0dee3Aa4da2fe39e38';
const fxRates = reactive(
  Object.fromEntries(Object.keys(CURRENCIES).map(id => [id, 0]))
);
const fxLoadStatus = ref(0);
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple';
const COINGECKO_PARAMS = '&vs_currencies=usd&include_24hr_change=true';

export function usePayment(network: number) {
  const auth = getInstance();
  const { web3 } = useWeb3();
  const { notify } = useFlashNotification();
  const loading = ref(false);
  const paymentTx = ref(null);
  const modalUnsupportedNetworkOpen = ref(false);
  const walletNetworkKey = computed(() => web3.value.network.key);

  refreshFx();

  async function transfer(amount: number, currencyId: string) {
    loading.value = true;
    const currency = CURRENCIES[currencyId];

    try {
      if (network.toString() !== walletNetworkKey.value) {
        modalUnsupportedNetworkOpen.value = true;
        return false;
      }

      const parsedAmount = parseUnits(
        amount.toFixed(currency.decimal),
        currency.decimal
      );
      let tx;

      if (currencyId === 'ethereum') {
        tx = await transferEth(parsedAmount);
      } else {
        tx = await transferErc20(parsedAmount, currency.address[network]);
      }
      paymentTx.value = { network, ...tx };

      return tx.wait();
    } catch (e: any) {
      if (/(insufficient|exceeds).*(balance|fund)/i.test(e.message)) {
        return notify(['red', 'Insufficient funds']);
      } else {
        console.error('Transfer error', e);
      }
    } finally {
      loading.value = false;
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

  async function refreshFx(): Promise<void> {
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}/price?ids=${Object.keys(CURRENCIES)
          .map(id => id)
          .join(',')}${COINGECKO_PARAMS}`
      );
      const data = await response.json();
      fxLoadStatus.value = 1;

      Object.keys(data).map(id => {
        fxRates[id] = data[id].usd;
      });
    } catch (e: any) {
      fxLoadStatus.value = 2;
    }
  }

  return {
    BASE_PRICE,
    BASE_UNIT,
    BASE_CURRENCY,
    DEFAULT_CURRENCY,
    DEFAULT_PLAN,
    CURRENCIES,
    PLANS,
    transfer,
    fxRates,
    loading,
    paymentTx,
    refreshFx,
    fxLoadStatus,
    modalUnsupportedNetworkOpen
  };
}
