import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import {
  generateSalt,
  getCollection,
  getSpaceCollection,
  mintTxLinkTag
} from '@/helpers/nftClaimer';

import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
const spaceCollectionsInfo = ref({});

export function useNFTClaimer(space: ExtendedSpace, proposal?: Proposal) {
  const NETWORK_KEY = '5';
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address guy, uint256 wad) external returns (bool)'
  ];
  const DEPLOY_CONTRACT_ADDRESS = '0x541acad0f4b9b683ffc43a39836eb4312044c59c';
  const DEPLOY_IMPLEMENTATION_ADDRESS =
    '0x07c3641ef7b2994e5029eab74f32a18b0944b70e';
  const DEPLOY_ABI = [
    'function deployProxy(address implementation, bytes initializer, uint256 salt, uint8 v, bytes32 r, bytes32 s)'
  ];
  const MINT_CONTRACT_ABI = [
    'function mint(address proposer, uint256 proposalId, uint256 salt, uint8 v, bytes32 r, bytes32 s)',
    'function setPowerSwitch(bool enable)'
  ];

  const mintNetwork = ref(NETWORK_KEY);
  const mintCurrency = ref('WETH');
  const mintPriceWei = ref(0);

  const inited = ref(false);
  const loading = ref(false);

  const auth = getInstance();
  const { web3, web3Account } = useWeb3();
  const { updateProgress, resetProgress, Step, Status } =
    useNFTClaimerProgress();
  const { formatNumber } = useIntl();

  const networkKey = computed(() => web3.value.network.key);
  const provider = getProvider(NETWORK_KEY);

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
      Step.CHECK_WETH_BALANCE,
      Status.WORKING,
      'Checking your wallet balance...'
    );

    const balanceWei = web3Account.value
      ? await contractWETH.balanceOf(web3Account.value)
      : 0;
    const balance = formatUnits(balanceWei, 'ether');
    console.debug(':_checkWETHBalance balance', balance);

    updateProgress(
      Step.CHECK_WETH_BALANCE,
      Status.SUCCESS,
      `${(+balance).toFixed(4)} WETH safe to spend`
    );

    if (BigNumber.from(balanceWei).lt(mintPriceWei.value)) {
      updateProgress(
        Step.CHECK_WETH_BALANCE,
        Status.ERROR,
        `You do not have sufficient fund, need at least ${formatNumber(
          parseFloat(formatUnits(mintPriceWei.value, 'ether'))
        )} WETH`
      );

      return false;
    }

    return true;
  }

  async function _checkWETHApproval(address: string) {
    updateProgress(
      Step.APPROVE_WETH_BALANCE,
      Status.WORKING,
      'Checking if contract is allowed to spend your WETH...'
    );

    const allowanceRaw = web3Account.value
      ? await contractWETH.allowance(web3Account.value, address)
      : 0;
    const allowance = formatUnits(allowanceRaw, 18);
    console.debug(':_checkWETHApproval allowance', allowance);

    if (BigNumber.from(allowanceRaw).lt(mintPriceWei.value)) {
      updateProgress(
        Step.APPROVE_WETH_BALANCE,
        Status.WORKING,
        `Please allow the contract to spend at least ${(+mintPriceWei.value).toFixed(
          4
        )} WETH`
      );

      const txPendingId = createPendingTransaction();
      try {
        const tx = await sendTransaction(
          auth.web3,
          WETH_CONTRACT_ADDRESS,
          WETH_CONTRACT_ABI,
          'approve',
          [address, mintPriceWei.value]
        );
        updateProgress(
          Step.APPROVE_WETH_BALANCE,
          Status.WORKING,
          'Waiting for confirmation...'
        );
        console.debug(':_checkWETHApproval tx', tx);
        updatePendingTransaction(txPendingId, { hash: tx.hash });

        const receipt = await tx.wait();

        updateProgress(
          Step.APPROVE_WETH_BALANCE,
          Status.SUCCESS,
          'Contract approved'
        );

        return receipt;
      } catch (e: any) {
        if (e.code === 'ACTION_REJECTED') {
          updateProgress(
            Step.APPROVE_WETH_BALANCE,
            Status.ERROR,
            'Transaction rejected'
          );
        } else {
          updateProgress(
            Step.APPROVE_WETH_BALANCE,
            Status.ERROR,
            'An unexpected error occured'
          );
          console.error(e);
        }
      } finally {
        removePendingTransaction(txPendingId);
      }
    } else {
      updateProgress(
        Step.APPROVE_WETH_BALANCE,
        Status.SUCCESS,
        'Contract already approved'
      );
      return true;
    }
  }

  async function _getBackendPayload(type: string, payload: any) {
    try {
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
    } catch (e) {
      throw new Error('TRUSTED_BACKEND_ERROR');
    }
  }

  async function init(force = false) {
    try {
      if (!space) return;

      let spaceCollectionInfo = spaceCollectionsInfo.value[space.id];

      if (!spaceCollectionInfo || force) {
        console.debug('_init FRESH:space', space.id);
        const info = await getSpaceCollection(space.id);

        if (info) {
          spaceCollectionInfo = {
            address: info.id,
            mintCount: parseInt(info.mintCount),
            maxSupply: parseInt(info.maxSupply),
            mintPrice: BigNumber.from(info.mintPrice),
            formattedMintPrice: formatUnits(info.mintPrice, 18),
            proposerFee: parseInt(info.proposerFee),
            treasuryAddress: info.spaceTreasury,
            enabled: info.enabled,
            createdAt: Date.now()
          };

          spaceCollectionsInfo.value[space.id] = spaceCollectionInfo;
        }
      }

      if (proposal && spaceCollectionInfo) {
        console.debug('_init FRESH:proposal', proposal.id);

        const info = await getCollection(BigInt(proposal?.id as string));

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
          spaceCollectionsInfo.value[space.id].proposals[proposal.id]
            .mintCount >= spaceCollectionsInfo.value[space.id].maxSupply
        ) {
          spaceCollectionsInfo.value[space.id].enabled = false;
        }
      }

      if (spaceCollectionInfo) {
        mintPriceWei.value = spaceCollectionInfo.mintPrice;
      }
      inited.value = true;

      return true;
    } catch (e) {
      console.error('NFTClaimer: unable to fetch data from Subgraph');
    }
  }

  async function toggleMintStatus(status: boolean) {
    const txPendingId = createPendingTransaction();
    try {
      console.debug(':toggleMintStatus start');
      const tx = await sendTransaction(
        auth.web3,
        spaceCollectionsInfo.value[space.id].address,
        MINT_CONTRACT_ABI,
        'setPowerSwitch',
        [status]
      );

      updatePendingTransaction(txPendingId, { hash: tx.hash });

      const receipt = await tx.wait();

      init(true);
      return receipt;
    } catch (e: any) {
      if (e.code !== 'ACTION_REJECTED') {
        console.error(e);
      }
    } finally {
      removePendingTransaction(txPendingId);
      console.debug(':toggleMintStatus end');
    }
  }

  async function sendTx(
    address: string,
    callback: () => Promise<any>,
    beforeSend: () => boolean,
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

      if (!beforeSend()) {
        return false;
      }
      const tx: any = await callback();

      if (tx) {
        console.debug(':mint tx', tx);
        updatePendingTransaction(txPendingId, { hash: tx.hash });
        afterSend(tx);

        const receipt = await tx.wait();
        console.debug('Receipt', receipt);

        return receipt;
      }
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        updateProgress(Step.SEND_TX, Status.ERROR, 'Transaction rejected');
      } else {
        updateProgress(
          Step.SEND_TX,
          Status.ERROR,
          'An unexpected error occured'
        );
        console.error(e);
      }
    } finally {
      removePendingTransaction(txPendingId);
    }
  }

  async function mint() {
    loading.value = true;
    resetProgress();

    try {
      const receipt = await sendTx(
        spaceCollectionsInfo.value[space.id].address,
        async () => {
          try {
            const { signature, salt, proposer, proposalId } =
              await _getBackendPayload('mint', {
                proposalAuthor: proposal?.author,
                id: proposal?.id,
                address: web3Account.value,
                salt: generateSalt()
              });

            // User has submitted data rejected by the trusted backend
            if (!signature) {
              updateProgress(
                Step.SEND_TX,
                Status.ERROR,
                'Invalid data submitted'
              );
              return;
            }

            updateProgress(
              Step.SEND_TX,
              Status.WORKING,
              'Waiting for your wallet confirmation...'
            );

            return sendTransaction(
              auth.web3,
              spaceCollectionsInfo.value[space.id].address,
              MINT_CONTRACT_ABI,
              'mint',
              [
                proposer,
                proposalId,
                salt,
                signature.v,
                signature.r,
                signature.s
              ]
            );
          } catch (e: any) {
            // Trusted backend server is unavailable
            if (e.message === 'TRUSTED_BACKEND_ERROR') {
              updateProgress(
                Step.SEND_TX,
                Status.ERROR,
                'Unable to verify and sign your data'
              );
              return;
            }

            updateProgress(
              Step.SEND_TX,
              Status.ERROR,
              'An unexpected error occured'
            );
            console.error(e);
          }
        },
        () => {
          updateProgress(
            Step.SEND_TX,
            Status.WORKING,
            'Verifying your data...'
          );

          return true;
        },
        tx => {
          updateProgress(Step.SEND_TX, Status.SUCCESS, mintTxLinkTag(tx.hash));
          updateProgress(
            Step.RESULT,
            Status.WORKING,
            'Waiting for confirmation...'
          );
        }
      );

      if (receipt) {
        updateProgress(
          Step.RESULT,
          Status.SUCCESS,
          `Completed with ${receipt.confirmations} confirmation(s)`
        );
      }
    } catch (e: any) {
      updateProgress(Step.SEND_TX, Status.ERROR, 'An unexpected error occured');
      console.error(e);
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
          return true;
        },
        () => {
          return '';
        }
      );
    } finally {
      loading.value = false;
    }
  }

  return {
    spaceCollectionsInfo,
    loading,
    mintNetwork,
    mintCurrency,
    inited,
    profiles,
    toggleMintStatus,
    mint,
    deploy,
    init
  };
}
