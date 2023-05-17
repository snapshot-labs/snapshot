import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { formatBytes32String } from '@ethersproject/strings';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';

import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

export function useNFTClaimer(space: ExtendedSpace, proposal: Proposal) {
  const NETWORK_KEY = '5';
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)'
  ];
  const MINT_CONTRACT_ADDRESS = '0xdDEd2972fB62907723463322b2C709CC9F5466C2';
  const MINT_CONTRACT_ABI = [
    'function mint(uint256 proposalId, uint256 salt, uint8 v, bytes32 r, bytes32 s)'
  ];

  const mintPrice = ref('0.1');
  const mintCurrency = ref('WETH');
  const mintCount = ref('0');
  const mintCountTotal = ref('500');

  const minting = ref(false);

  const auth = getInstance();
  const { web3, web3Account } = useWeb3();

  const networkKey = computed(() => web3.value.network.key);
  const provider = getProvider(NETWORK_KEY);

  const { t } = useI18n();
  const { notify } = useFlashNotification();
  const {
    createPendingTransaction,
    updatePendingTransaction,
    removePendingTransaction
  } = useTxStatus();

  async function _switchNetwork() {
    // check current network
    if (networkKey.value === NETWORK_KEY) return;

    // switch network
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: `0x${NETWORK_KEY}`
        }
      ]
    });
    await sleep(1000);
  }

  const contractWETH = new Contract(
    WETH_CONTRACT_ADDRESS,
    WETH_CONTRACT_ABI,
    provider
  );

  async function _checkWETHBalance() {
    const balanceRaw = web3Account.value
      ? await contractWETH.balanceOf(web3Account.value)
      : 0;
    const balance = formatUnits(balanceRaw, 18);

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(balanceRaw).lt(mintPriceWei))
      throw new Error('Not enough WETH balance');

    console.log(':_checkWETHBalance balance', balanceRaw, balance);
  }

  async function _checkWETHApproval() {
    const allowanceRaw = web3Account.value
      ? await contractWETH.allowance(web3Account.value, MINT_CONTRACT_ADDRESS)
      : 0;
    const allowance = formatUnits(allowanceRaw, 18);
    console.log(':_checkWETHApproval allowance', allowanceRaw, allowance);

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(allowanceRaw).lt(mintPriceWei))
      throw new Error('Not enough WETH allowance');
  }

  async function _getSignature() {
    // throw new Error('Wrong signature');
  }

  async function _init() {
    console.log('_init start');
    // set mintPrice, mintCurrency, mintCount, mintCountTotal
  }

  // check network => switch network
  // check balance => break with notify about WETH (contract info, instructions)
  // check approval => approve
  // sign message
  // fetch BE with spaceId, proposalId, salt?
  // check, approve, WETH flow
  async function mint() {
    console.log(':mint start', auth, web3);
    const txPendingId = createPendingTransaction();
    minting.value = true;
    try {
      await _switchNetwork();
      await _checkWETHBalance();
      await _checkWETHApproval();
      await _getSignature();
      await sleep(1000);

      const tx = await sendTransaction(
        auth.web3,
        MINT_CONTRACT_ADDRESS,
        MINT_CONTRACT_ABI,
        'mint',
        [proposal.id, 0, 1, formatBytes32String('2'), formatBytes32String('3')]
      );
      console.log(':mint tx', tx);

      notify(t('notify.transactionSent'));
      updatePendingTransaction(txPendingId, { hash: tx.hash });
      minting.value = false;
      const receipt = await tx.wait();
      console.log('Receipt', receipt);
      notify(t('notify.delegationSuccess'));
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      minting.value = false;
      removePendingTransaction(txPendingId);
    }
  }

  _init();

  return {
    mintPrice,
    mintCurrency,
    mintCount,
    mintCountTotal,
    minting,

    mint
  };
}
