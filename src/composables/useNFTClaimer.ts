import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction, clone } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useStorage } from '@vueuse/core';
import {
  generateSalt,
  getCollection,
  getSpaceCollection
} from '@/helpers/nftClaimer';

import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const spaceCollectionsInfo = useStorage(
  'snapshot.proposals.nftCollections',
  {}
);

export function useNFTClaimer(space: ExtendedSpace, proposal?: Proposal) {
  const NETWORK_KEY = '5';
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address guy, uint256 wad) external returns (bool)'
  ];
  const DEPLOY_CONTRACT_ADDRESS = '0x054a600d8B766c786270E25872236507D8459D8F';
  const DEPLOY_IMPLEMENTATION_ADDRESS =
    '0x33505720a7921d23E6b02EB69623Ed6A008Ca511';
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

  enum ProgressStep {
    CHECK_WETH_BALANCE,
    APPROVE_WETH_BALANCE,
    SEND_TX,
    RESULT
  }

  const mintNetwork = ref(NETWORK_KEY);
  const mintCurrency = ref('WETH');
  const mintPrice = ref('0.1');

  const defaultProgress = {
    [ProgressStep.CHECK_WETH_BALANCE]: {
      name: 'Checking WETH balance',
      description: '',
      status: 'FUTURE'
    },
    [ProgressStep.APPROVE_WETH_BALANCE]: {
      name: 'Approving WETH spending',
      description: '',
      status: 'FUTURE'
    },
    [ProgressStep.SEND_TX]: {
      name: 'Minting',
      description: '',
      status: 'FUTURE'
    },
    [ProgressStep.RESULT]: {
      name: 'Result',
      description: '',
      status: 'FUTURE'
    }
  };
  const inited = ref(false);
  const loading = ref(false);
  const progress = ref<
    Record<ProgressStep, { name: string; description: string; status: string }>
  >(clone(defaultProgress));

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

  const { profiles, loadProfiles } = useProfiles();

  async function _switchNetwork() {
    // check current network
    if (networkKey.value === NETWORK_KEY) return true;

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

    return true;
  }

  const contractWETH = new Contract(
    WETH_CONTRACT_ADDRESS,
    WETH_CONTRACT_ABI,
    provider
  );

  async function _checkWETHBalance() {
    updateProgress(
      ProgressStep.CHECK_WETH_BALANCE,
      'WORKING',
      'Checking your wallet balance...'
    );

    const balanceRaw = web3Account.value
      ? await contractWETH.balanceOf(web3Account.value)
      : 0;
    const balance = formatUnits(balanceRaw, 'ether');
    console.log(':_checkWETHBalance balance', balance);

    updateProgress(
      ProgressStep.CHECK_WETH_BALANCE,
      'SUCCESS',
      `${(+balance).toFixed(4)} WETH safe to spend`
    );

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(balanceRaw).lt(mintPriceWei)) {
      updateProgress(
        ProgressStep.CHECK_WETH_BALANCE,
        'ERROR',
        `You do not have sufficient fund, need at least ${mintPriceWei} WETH`
      );

      return false;
    }

    return true;
  }

  async function _checkWETHApproval(address: string) {
    updateProgress(
      ProgressStep.APPROVE_WETH_BALANCE,
      'WORKING',
      'Checking if contract is allowed to spend your WETH...'
    );

    const allowanceRaw = web3Account.value
      ? await contractWETH.allowance(web3Account.value, address)
      : 0;
    const allowance = formatUnits(allowanceRaw, 18);
    console.log(':_checkWETHApproval allowance', allowance);

    const mintPriceWei = parseUnits(mintPrice.value, 18);
    if (BigNumber.from(allowanceRaw).lt(mintPriceWei)) {
      updateProgress(
        ProgressStep.APPROVE_WETH_BALANCE,
        'WORKING',
        `Please allow the contract to spend at least ${(+mintPrice.value).toFixed(
          4
        )} WETH`
      );

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
        return tx.wait();
      } catch (e: any) {
        if (e.code === 'ACTION_REJECTED') {
          updateProgress(
            ProgressStep.APPROVE_WETH_BALANCE,
            'ERROR',
            'Transaction rejected'
          );
        } else {
          notify(['red', t('notify.somethingWentWrong')]);
          console.log(e);
        }
      } finally {
        removePendingTransaction(txPendingId);
      }
    } else {
      progress.value[ProgressStep.APPROVE_WETH_BALANCE].status = 'SUCCESS';
      progress.value[ProgressStep.APPROVE_WETH_BALANCE].description =
        'Contract already approved';
      return true;
    }
  }

  async function _getBackendPayload(type: string, payload: any) {
    const res = await fetch(
      `${import.meta.env.VITE_SIDEKICK_URL}/api/nft-claimer/${type}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
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
          address: info.id,
          maxSupply: parseInt(info.maxSupply),
          mintPrice: parseInt(info.mintPrice),
          formattedMintPrice: formatUnits(info.mintPrice, 18),
          proposerFee: parseInt(info.proposerFee),
          treasuryAddress: info.spaceTreasury,
          enabled: info.enabled,
          createdAt: Date.now()
        };

        spaceCollectionsInfo.value[space.id] = spaceCollectionInfo;
        mintPrice.value = info.mintPrice;
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

  async function sendTx(
    address: string,
    callback: () => Promise<any>,
    beforeSend: () => void,
    afterSend: (tx: any) => void
  ) {
    const txPendingId = createPendingTransaction();

    try {
      if (
        !(await _switchNetwork()) ||
        !(await _checkWETHBalance()) ||
        !(await _checkWETHApproval(address))
      ) {
        return false;
      }

      beforeSend();
      const tx: any = await callback();

      console.log(':mint tx', tx);

      notify(t('notify.transactionSent'));
      updatePendingTransaction(txPendingId, { hash: tx.hash });
      afterSend(tx);

      const receipt = await tx.wait();
      console.log('Receipt', receipt);

      return receipt;
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        updateProgress(ProgressStep.SEND_TX, 'ERROR', 'Transaction rejected');
      } else {
        notify(['red', t('notify.somethingWentWrong')]);
        console.log(e);
      }
    } finally {
      removePendingTransaction(txPendingId);
    }
  }

  async function mint() {
    progress.value = clone(defaultProgress);
    loading.value = true;

    try {
      const { signature, salt, proposer, proposalId } =
        await _getBackendPayload('mint', {
          proposalAuthor: proposal?.author,
          id: proposal?.id,
          address: web3Account.value,
          salt: generateSalt()
        });

      const receipt = await sendTx(
        spaceCollectionsInfo.value[space.id].address,
        () => {
          return sendTransaction(
            auth.web3,
            spaceCollectionsInfo.value[space.id].address,
            MINT_CONTRACT_ABI,
            'mint',
            [proposer, proposalId, salt, signature.v, signature.r, signature.s]
          );
        },
        () => {
          updateProgress(
            ProgressStep.SEND_TX,
            'WORKING',
            'Waiting for your wallet confirmation...'
          );
        },
        tx => {
          updateProgress(ProgressStep.SEND_TX, 'SUCCESS', tx.hash);
          updateProgress(
            ProgressStep.RESULT,
            'WORKING',
            'Waiting for confirmation'
          );
        }
      );

      if (receipt) {
        updateProgress(ProgressStep.RESULT, 'SUCCESS', 'Confirmed');
      }
    } finally {
      loading.value = false;
    }
  }

  async function deploy(params: Record<string, string | number>) {
    loading.value = true;

    try {
      const { signature, initializer, salt } = await _getBackendPayload(
        'deploy',
        {
          id: space.id,
          address: web3Account.value,
          salt: generateSalt(),
          maxSupply: params.maxSupply,
          mintPrice: parseUnits(
            params.formattedMintPrice.toString(),
            18
          ).toString(),
          proposerFee: params.proposerFee,
          spaceTreasury: params.treasuryAddress
        }
      );

      await sendTx(
        DEPLOY_IMPLEMENTATION_ADDRESS,
        () => {
          return sendTransaction(
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
        },
        () => {
          return '';
        },
        () => {
          return '';
        }
      );
    } finally {
      loading.value = false;
    }
  }

  function updateProgress(
    key: ProgressStep,
    status: string,
    description: string
  ) {
    progress.value[key].status = status;
    progress.value[key].description = description;
  }

  return {
    spaceCollectionsInfo,
    loading,
    mintNetwork,
    mintCurrency,
    inited,
    profiles,
    progress,
    // enableNFTClaimer,
    // disableNFTClaimer,
    mint,
    deploy,
    init
  };
}
