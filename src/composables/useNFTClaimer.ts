import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import {
  generateSalt,
  mintTxLinkTag,
  MINT_NETWORK,
  MINT_CURRENCY
} from '@/helpers/nftClaimer';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

export function useNFTClaimer(space: ExtendedSpace, proposal?: Proposal) {
  const WETH_CONTRACT_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
  const WETH_CONTRACT_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address guy, uint256 wad) external returns (bool)'
  ];
  const UPDATE_ABI = [
    'function updateSettings(uint128 _maxSupply, uint256 _mintPrice, uint8 _proposerFee, address _spaceTreasury)'
  ];
  const MINT_CONTRACT_ABI = ['function setPowerSwitch(bool enable)'];

  const mintNetwork = ref(MINT_NETWORK);
  const mintCurrency = ref(MINT_CURRENCY);
  const mintPriceWei = ref<BigNumber>(BigNumber.from(0));

  const loading = ref(false);

  const auth = getInstance();
  const { web3, web3Account } = useWeb3();
  const { updateProgress, resetProgress, Step, Status, errored } =
    useNFTClaimerProgress();
  const { getContractInfo, getCollectionInfo, init, refresh } =
    useNFTClaimerStorage();
  const { formatNumber } = useIntl();

  const networkKey = computed(() => web3.value.network.key);
  const provider = getProvider(MINT_NETWORK);

  const {
    createPendingTransaction,
    updatePendingTransaction,
    removePendingTransaction
  } = useTxStatus();
  const { notify } = useFlashNotification();

  init(proposal || space);

  async function _switchNetwork() {
    // check current network
    if (networkKey.value === MINT_NETWORK) return true;

    // switch network
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: `0x${MINT_NETWORK}`
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
        `Please allow the contract to spend at least ${(+formatUnits(
          mintPriceWei.value,
          18
        )).toFixed(4)} WETH`
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

        // Check the balance again, to ensure the user
        // has not approved an amount less than the minimum
        const newAllowanceWei = web3Account.value
          ? await contractWETH.allowance(web3Account.value, address)
          : 0;
        const balance = formatUnits(newAllowanceWei, 'ether');

        if (BigNumber.from(newAllowanceWei).gte(mintPriceWei.value)) {
          updateProgress(
            Step.APPROVE_WETH_BALANCE,
            Status.SUCCESS,
            'Contract approved'
          );
          return receipt;
        } else {
          updateProgress(
            Step.APPROVE_WETH_BALANCE,
            Status.ERROR,
            `The approved amount (${(+balance).toFixed(
              4
            )} WETH) is not enough to cover the mint price`
          );
        }
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

  async function toggleMintStatus(status: boolean) {
    loading.value = true;
    const txPendingId = createPendingTransaction();
    try {
      console.debug(':toggleMintStatus start');
      const tx = await sendTransaction(
        auth.web3,
        getContractInfo(space.id).address,
        MINT_CONTRACT_ABI,
        'setPowerSwitch',
        [status]
      );

      updatePendingTransaction(txPendingId, { hash: tx.hash });

      const receipt = await tx.wait();

      refresh(space);
      notify([
        'green',
        `Minting on the space has been ${status ? 'enabled' : 'disabled'}`
      ]);
      return receipt;
    } catch (e: any) {
      if (e.code !== 'ACTION_REJECTED') {
        notify(['red', 'An unexpected error occured']);
        console.error(e);
      } else {
        return notify(['red', 'Transaction rejected']);
      }
    } finally {
      removePendingTransaction(txPendingId);
      console.debug(':toggleMintStatus end');
      loading.value = false;
    }
  }

  async function sendTx(
    callback: () => Promise<any>,
    afterSend: (tx: any) => void
  ) {
    let txPendingId: string | null = null;

    try {
      txPendingId = createPendingTransaction();
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
      if (txPendingId) {
        removePendingTransaction(txPendingId);
      }
    }
  }

  async function mint() {
    loading.value = true;
    resetProgress();
    const { address } = getContractInfo(space.id);

    try {
      mintPriceWei.value = getCollectionInfo(
        space.id,
        proposal?.id as string
      ).mintPrice;
      const receipt = await sendTx(
        async () => {
          try {
            updateProgress(
              Step.CHECK_REMAINING_SUPPLY,
              Status.WORKING,
              'Checking remaining supply...'
            );
            await refresh(proposal as Proposal);

            const info = getCollectionInfo(space.id, proposal?.id as string);

            if (info.maxSupply > info.mintCount) {
              updateProgress(
                Step.CHECK_REMAINING_SUPPLY,
                Status.SUCCESS,
                `${info.maxSupply - info.mintCount} NFTs available`
              );
            } else {
              updateProgress(
                Step.CHECK_REMAINING_SUPPLY,
                Status.ERROR,
                'All NFTs have been minted'
              );
              return;
            }
          } catch (e: any) {
            updateProgress(
              Step.CHECK_REMAINING_SUPPLY,
              Status.ERROR,
              'Unable to check the remaining supply'
            );
            return;
          }

          if (
            !(await _switchNetwork()) ||
            !(await _checkWETHBalance()) ||
            !(await _checkWETHApproval(address))
          ) {
            return false;
          }

          try {
            updateProgress(
              Step.SEND_TX,
              Status.WORKING,
              'Verifying your data...'
            );

            const { signature, salt, proposer, proposalId, abi } =
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

            return sendTransaction(auth.web3, address, [abi], 'mint', [
              proposer,
              proposalId,
              salt,
              signature.v,
              signature.r,
              signature.s
            ]);
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
        refresh(proposal as Proposal);
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
      const {
        signature,
        initializer,
        salt,
        abi,
        verifyingContract,
        implementation
      } = await _getBackendPayload('deploy', {
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
      });

      await sendTx(
        () => {
          return sendTransaction(
            auth.web3,
            verifyingContract,
            [abi],
            'deployProxy',
            [
              implementation,
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
        }
      );
      refresh(space);
    } finally {
      loading.value = false;
    }
  }

  async function update(params: Record<string, string | number>) {
    loading.value = true;

    const NO_UPDATE_U256 =
      '0xf2cda9b13ed04e585461605c0d6e804933ca828111bd94d4e6a96c75e8b048ba';
    const NO_UPDATE_U128 = '0xf2cda9b13ed04e585461605c0d6e8049';
    const NO_UPDATE_ADDRESS = '0xf2cda9b13ed04e585461605c0d6e804933ca8281';
    const NO_UPDATE_U8 = '0xf2';

    const spaceInfo = getContractInfo(space.id);
    let needUpdate = false;
    const updatedParams = {
      maxSupply: NO_UPDATE_U128,
      formattedMintPrice: NO_UPDATE_U256,
      proposerFee: NO_UPDATE_U8,
      treasuryAddress: NO_UPDATE_ADDRESS
    };

    Object.keys(updatedParams).forEach(field => {
      if (spaceInfo[field] !== params[field]) {
        needUpdate = true;
        updatedParams[field] = params[field];
        if (field === 'formattedMintPrice') {
          updatedParams[field] = parseUnits(
            params[field].toString(),
            18
          ).toString();
        }
      }
    });

    if (!needUpdate) {
      return false;
    }

    const txPendingId = createPendingTransaction();
    try {
      const tx = await sendTransaction(
        auth.web3,
        spaceInfo.address,
        UPDATE_ABI,
        'updateSettings',
        Object.values(updatedParams)
      );
      updatePendingTransaction(txPendingId, { hash: tx.hash });

      const receipt = await tx.wait();
      refresh(space);
      notify(['green', 'Settings have been updated']);
      return receipt;
    } catch (e: any) {
      if (e.code !== 'ACTION_REJECTED') {
        notify(['red', 'An unexpected error occured']);
        console.error(e);
      } else {
        return notify(['red', 'Transaction rejected']);
      }
    } finally {
      removePendingTransaction(txPendingId);
      loading.value = false;
    }
  }

  return {
    loading,
    errored,
    mint,
    deploy,
    update,
    toggleMintStatus
  };
}
