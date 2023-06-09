import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { randomBytes } from '@ethersproject/random';
import { useStorage } from '@vueuse/core';

import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const collectionsInfo = useStorage('snapshot.proposals.nftCollections', {});

export function useNFTClaimer(space: ExtendedSpace, proposal: Proposal) {
  const NETWORK_KEY = '5';
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address guy, uint256 wad) external returns (bool)'
  ];
  const FACTORY_ADDRESS = '0x1ff32aE352C07eB95Ce8FDD672E9568936b331e4';
  const FACTORY_ABI = [
    'deployProxy(address implementation, bytes initializer, bytes32 salt, uint8 v, bytes32 r, bytes32 s)'
  ];
  // TODO get mint contract address from space
  const MINT_CONTRACT_ADDRESS = '0x8d153afb2e6a9d088e1f4409554a26466a25e0f1';
  const MINT_CONTRACT_ABI = [
    'function balanceOf(address, uint256 id) view returns (uint256)',
    'function mint(uint256 proposalId, uint256 salt, uint8 v, bytes32 r, bytes32 s)',
    'function mintPrice() view returns (uint256)',
    'function mintPrices(uint256 proposalId) view returns (uint256)',
    'function maxSupply() view returns (uint128)',
    'function supplies(uint256 proposalId) view returns (uint256)'
  ];

  const mintNetwork = ref(NETWORK_KEY);
  const mintAddress = ref(MINT_CONTRACT_ADDRESS);
  const mintCurrency = ref('WETH');
  const mintPrice = ref('0.1');
  const mintCount = ref(0);
  const mintCountTotal = ref(500);

  const inited = ref(false);
  const minting = ref(false);

  const auth = getInstance();
  const { web3, web3Account } = useWeb3();
  const { modalAccountOpen } = useModal();

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
    console.log(':_checkWETHBalance balance', balance);

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(balanceRaw).lt(mintPriceWei))
      throw new Error('Not enough WETH balance');
  }

  async function _checkWETHApproval() {
    const allowanceRaw = web3Account.value
      ? await contractWETH.allowance(web3Account.value, MINT_CONTRACT_ADDRESS)
      : 0;
    const allowance = formatUnits(allowanceRaw, 18);
    console.log(':_checkWETHApproval allowance', allowance);

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(allowanceRaw).lt(mintPriceWei)) {
      // TODO check id for next? to throttle?
      const txPendingId = createPendingTransaction();
      try {
        const tx = await sendTransaction(
          auth.web3,
          WETH_CONTRACT_ADDRESS,
          WETH_CONTRACT_ABI,
          'approve',
          [MINT_CONTRACT_ADDRESS, mintPriceWei]
        );
        console.log(':_checkWETHApproval tx', tx);
        updatePendingTransaction(txPendingId, { hash: tx.hash });
        await tx.wait();
      } catch (e) {
        notify(['red', t('notify.somethingWentWrong')]);
        console.log(e);
      } finally {
        removePendingTransaction(txPendingId);
      }
    }
  }

  async function _getPayload(type = 'deploy', salt) {
    const id = type === 'deploy' ? space.id : proposal.id;
    const res = await fetch(`https://sh5.co/api/nft-claimer/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        address: web3Account.value,
        salt
      })
    });
    const data = await res.json();
    return data;
  }

  async function init() {
    if (!proposal || !space) return;

    let collectionInfo = collectionsInfo.value[proposal.id];

    if (!collectionInfo || collectionInfo.createdAt < Date.now() - 1000 * 60) {
      console.log('_init FRESH', proposal.id);
      const contractCollection = new Contract(
        MINT_CONTRACT_ADDRESS,
        MINT_CONTRACT_ABI,
        provider
      );

      const maxSupply = await contractCollection.maxSupply();
      const supplies = await contractCollection.supplies(proposal.id);
      const mintPrices = await contractCollection.mintPrices(proposal.id);
      const mintPriceRaw = await contractCollection.mintPrice();
      const balanceOf = await contractCollection.balanceOf(
        web3Account.value,
        proposal.id
      );

      collectionInfo = {
        mintCountTotal: maxSupply.toNumber(),
        mintCount: balanceOf.toNumber(),
        mintPrice: formatUnits(mintPriceRaw, 18),
        balanceOf: balanceOf.toNumber(),
        createdAt: Date.now()
      };
      collectionsInfo.value[proposal.id] = collectionInfo;
    }

    mintCountTotal.value = collectionInfo.mintCountTotal;
    mintCount.value = collectionInfo.mintCount;
    mintPrice.value = collectionInfo.mintPrice;

    inited.value = true;
  }

  async function enableNFTClaimer() {
    if (!web3Account.value) {
      modalAccountOpen.value = true;
      return;
    }
    const txPendingId = createPendingTransaction();
    try {
      console.log(':enableNFTClaimer start');
      await _switchNetwork();

      const salt = BigNumber.from(randomBytes(32)).toString();
      const signature = await _getPayload('proposal', salt);
      console.log(':enableNFTClaimer signature', signature);
      return;
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      removePendingTransaction(txPendingId);
    }
  }

  async function disableNFTClaimer() {
    const txPendingId = createPendingTransaction();
    try {
      console.log(':disableNFTClaimer start');
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      removePendingTransaction(txPendingId);
    }
  }

  async function mint() {
    if (!web3Account.value) {
      modalAccountOpen.value = true;
      return;
    }
    const txPendingId = createPendingTransaction();
    minting.value = true;
    try {
      await _switchNetwork();
      await _checkWETHBalance();
      await _checkWETHApproval();

      const salt = BigNumber.from(randomBytes(32)).toString();
      const { signature } = await _getPayload('mint', salt);

      const tx = await sendTransaction(
        auth.web3,
        MINT_CONTRACT_ADDRESS,
        MINT_CONTRACT_ABI,
        'mint',
        [
          BigNumber.from(proposal.id).toString(),
          salt,
          signature.v,
          signature.r,
          signature.s
        ]
      );
      console.log(':mint tx', tx);

      notify(t('notify.transactionSent'));
      updatePendingTransaction(txPendingId, { hash: tx.hash });
      const receipt = await tx.wait();
      console.log('Receipt', receipt);
      minting.value = false;
      // Optimistic update mint count
      mintCount.value += 1;
      notify(t('notify.youDidIt'));
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      minting.value = false;
      removePendingTransaction(txPendingId);
    }
  }

  return {
    mintNetwork,
    mintAddress,
    mintPrice,
    mintCurrency,
    mintCount,
    mintCountTotal,
    minting,
    inited,

    enableNFTClaimer,
    disableNFTClaimer,
    mint,
    init
  };
}
