import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { randomBytes } from '@ethersproject/random';
import { useStorage } from '@vueuse/core';
import { getCollection, getSpaceCollection } from '@/helpers/nftClaimer';

import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { hexZeroPad, hexlify } from '@ethersproject/bytes';

const spaceCollectionsInfo = useStorage(
  'snapshot.proposals.nftCollections',
  {}
);

const SIDEKICK_URL = 'http://localhost:3005';

export function useNFTClaimer(space: ExtendedSpace, proposal?: Proposal) {
  const NETWORK_KEY = '5';
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address guy, uint256 wad) external returns (bool)'
  ];
  const DEPLOY_CONTRACT_ADDRESS = '0xb2A5750dB0Be196b33C09D4037864DF66b2826C4';
  const DEPLOY_IMPLEMENTATION_ADDRESS =
    '0x45AE362C00Ec3f932a59197cDD976d0975393bBF';
  const DEPLOY_ABI = [
    'function deployProxy(address implementation, bytes initializer, uint256 salt, uint8 v, bytes32 r, bytes32 s)'
  ];
  const MINT_CONTRACT_ABI = [
    'function balanceOf(address, uint256 id) view returns (uint256)',
    'function mint(address proposer, uint256 proposalId, uint256 salt, uint8 v, bytes32 r, bytes32 s)',
    'function mintPrice() view returns (uint256)',
    'function mintPrices(uint256 proposalId) view returns (uint256)',
    'function maxSupply() view returns (uint128)',
    'function supplies(uint256 proposalId) view returns (uint256)'
  ];

  const mintNetwork = ref(NETWORK_KEY);
  const mintCurrency = ref('WETH');
  const mintPrice = ref('0.1');
  const mintCount = ref(0);

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

  const { profiles, loadProfiles } = useProfiles();

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

  async function _checkWETHApproval(address: string) {
    const allowanceRaw = web3Account.value
      ? await contractWETH.allowance(web3Account.value, address)
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
          [address, mintPriceWei]
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

  async function _getBackendPayload(type: string, payload: any) {
    const res = await fetch(`${SIDEKICK_URL}/api/nft-claimer/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  function getSpaceCollectionInfo() {
    return getSpaceCollection(space.id);
  }

  function getCollectionInfo() {
    return getCollection(BigInt(proposal?.id as string));
  }

  async function init() {
    if (!space) return;

    let spaceCollectionInfo = spaceCollectionsInfo.value[space.id];

    if (
      !spaceCollectionInfo ||
      spaceCollectionInfo.createdAt < Date.now() - 1000 * 60
    ) {
      console.log('_init FRESH', space.id);
      const info = await getSpaceCollectionInfo();

      if (info) {
        spaceCollectionInfo = {
          id: info.id,
          maxSupply: parseInt(info.maxSupply),
          mintPrice: parseInt(info.mintPrice),
          formattedMintPrice: formatUnits(info.mintPrice, 18),
          proposerCut: parseInt(info.proposerFee),
          treasuryAddress: info.spaceTreasury,
          enabled: info.enabled,
          createdAt: Date.now()
        };

        spaceCollectionsInfo.value[space.id] = spaceCollectionInfo;
      }
    }

    if (proposal && spaceCollectionInfo) {
      const info = await getCollectionInfo();

      spaceCollectionsInfo.value[space.id].proposals ||= {};
      const defaultInfo = {
        id: null,
        mintCount: 0,
        mints: []
      };

      spaceCollectionsInfo.value[space.id].proposals[proposal.id] =
        info ?? defaultInfo;
      loadProfiles(
        spaceCollectionsInfo.value[space.id].proposals[proposal.id].mints.map(
          p => p.minterAddress
        )
      );

      if (
        spaceCollectionsInfo.value[space.id].proposals[proposal.id].mintCount >=
        spaceCollectionsInfo.value[space.id].maxSupply
      ) {
        spaceCollectionsInfo.value[space.id].enabled = false;
      }
    }

    inited.value = true;
  }

  // async function enableNFTClaimer() {
  //   if (!web3Account.value) {
  //     modalAccountOpen.value = true;
  //     return;
  //   }
  //   const txPendingId = createPendingTransaction();
  //   try {
  //     console.log(':enableNFTClaimer start');
  //     await _switchNetwork();

  //     const salt = BigNumber.from(randomBytes(32)).toString();
  //     const signature = await _getPayload('proposal', salt);
  //     console.log(':enableNFTClaimer signature', signature);
  //     return;
  //   } catch (e) {
  //     notify(['red', t('notify.somethingWentWrong')]);
  //     console.log(e);
  //   } finally {
  //     removePendingTransaction(txPendingId);
  //   }
  // }

  // async function disableNFTClaimer() {
  //   const txPendingId = createPendingTransaction();
  //   try {
  //     console.log(':disableNFTClaimer start');
  //   } catch (e) {
  //     notify(['red', t('notify.somethingWentWrong')]);
  //     console.log(e);
  //   } finally {
  //     removePendingTransaction(txPendingId);
  //   }
  // }

  async function mint() {
    if (!web3Account.value || !proposal) {
      modalAccountOpen.value = true;
      return;
    }
    const txPendingId = createPendingTransaction();
    minting.value = true;
    try {
      await _switchNetwork();
      await _checkWETHBalance();
      await _checkWETHApproval(spaceCollectionsInfo.value[space.id].id);

      const salt = BigNumber.from(randomBytes(32)).toString();
      const { signature } = await _getBackendPayload('mint', {
        proposalAuthor: proposal.author,
        id: proposal.id,
        address: web3Account.value,
        salt
      });

      const tx = await sendTransaction(
        auth.web3,
        spaceCollectionsInfo.value[space.id].id,
        MINT_CONTRACT_ABI,
        'mint',
        [
          proposal.author,
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

  async function deploy(params: Record<string, string | number>) {
    if (!web3Account.value) {
      modalAccountOpen.value = true;
      return;
    }
    const txPendingId = createPendingTransaction();
    minting.value = true;
    try {
      await _switchNetwork();
      await _checkWETHBalance();
      await _checkWETHApproval(DEPLOY_CONTRACT_ADDRESS);

      const salt = hexZeroPad(hexlify(Math.floor(Math.random() * 1000)), 32);
      const { signature, initializer } = await _getBackendPayload('deploy', {
        id: space.id,
        address: web3Account.value,
        salt,
        maxSupply: params.maxSupply,
        mintPrice: params.mintPrice,
        proposerFee: params.proposerCut,
        spaceTreasury: params.treasuryAddress
      });

      const tx = await sendTransaction(
        auth.web3,
        DEPLOY_CONTRACT_ADDRESS,
        DEPLOY_ABI,
        'deployProxy',
        [
          DEPLOY_IMPLEMENTATION_ADDRESS,
          initializer,
          salt,
          signature.v,
          signature.r,
          signature.s
        ]
      );
      console.log(':mint tx', tx);

      // notify(t('notify.transactionSent'));
      // updatePendingTransaction(txPendingId, { hash: tx.hash });
      // const receipt = await tx.wait();
      // console.log('Receipt', receipt);
      // minting.value = false;
      // // Optimistic update mint count
      // mintCount.value += 1;
      // notify(t('notify.youDidIt'));
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      minting.value = false;
      removePendingTransaction(txPendingId);
    }
  }

  return {
    spaceCollectionsInfo,
    minting,
    mintNetwork,
    mintCurrency,
    inited,
    profiles,
    // enableNFTClaimer,
    // disableNFTClaimer,
    mint,
    deploy,
    init
  };
}
