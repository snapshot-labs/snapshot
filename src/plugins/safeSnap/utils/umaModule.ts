import { ref } from 'vue';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { UMA_MODULE_ABI, ERC20_ABI, UMA_ORACLE_ABI } from '../constants';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { useWeb3 } from '@/composables';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { defaultAbiCoder } from '@ethersproject/abi';
import { toUtf8Bytes } from '@ethersproject/strings';

const getBondDetails = async (
  provider: StaticJsonRpcProvider,
  moduleAddress: string
) => {
  const { web3Account } = useWeb3();

  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);

  const erc20Contract = new Contract(
    await moduleContract.collateral(),
    ERC20_ABI,
    provider
  );

  const bondInfo = ref({
    collateral: erc20Contract.address,
    symbol: await erc20Contract.symbol(),
    decimals: await erc20Contract.decimals(),
    currentUserBondAllowance: BigNumber.from(0),
    currentUserBalance: BigNumber.from(0)
  });

  async function updateCurrentUserBondInfo() {
    bondInfo.value.currentUserBondAllowance = BigNumber.from(
      web3Account.value
        ? await erc20Contract.allowance(web3Account.value, moduleAddress)
        : 0
    );
    bondInfo.value.currentUserBalance = BigNumber.from(
      web3Account.value ? await erc20Contract.balanceOf(web3Account.value) : 0
    );
  }
  await updateCurrentUserBondInfo();

  return bondInfo.value;
};

export const getModuleDetailsUma = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string,
  transactions: any
): Promise<{
  dao: string;
  oracle: string;
  rules: string;
  minimumBond: number;
  expiration: number;
  allowance: BigNumber;
  collateral: string;
  decimals: number;
  symbol: string;
  userBalance: BigNumber;
  needsBondApproval: boolean;
  proposalEvent: any;
  proposalExecuted: boolean;
}> => {
  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);
  const moduleDetails = await multicall(network, provider, UMA_MODULE_ABI, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracle'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);
  let needsApproval = false;
  const minimumBond = moduleDetails[3][0];
  const optimisticOracle = moduleDetails[1][0];
  const bondDetails = await getBondDetails(provider, moduleAddress);

  if (
    Number(minimumBond) > 0 &&
    Number(minimumBond) > Number(bondDetails.currentUserBondAllowance)
  ) {
    needsApproval = true;
  }

  // Create ancillary data for proposal hash
  let ancillaryData = '';
  let timestamp = 0;
  let proposalHash;
  if (transactions !== undefined) {
    proposalHash = keccak256(
      defaultAbiCoder.encode(
        ['(address to, uint8 operation, uint256 value, bytes data)[]'],
        [transactions]
      )
    );

    ancillaryData = pack(
      ['string', 'bytes', 'bytes'],
      [
        '',
        pack(['string', 'string'], ['proposalHash', ':']),
        toUtf8Bytes(proposalHash.replace('0x', ''))
      ]
    );
    timestamp = await moduleContract.proposalHashes(proposalHash);
  }

  // Search for requests with matching ancillary data
  const oracleContract = new Contract(
    optimisticOracle,
    UMA_ORACLE_ABI,
    provider
  );

  // TODO: Customize this block lookback based on chain and test with L2 network (Polygon)
  const proposalEvents = await oracleContract.queryFilter(
    oracleContract.filters.ProposePrice(moduleAddress)
  );
  const thisModuleProposalEvents = proposalEvents.filter(
    event =>
      event.args?.ancillaryData === ancillaryData &&
      Number(event.args?.timestamp) === Number(timestamp)
  );

  // Get the full proposal event (with state and disputer).
  const proposalEvent = await Promise.all(
    thisModuleProposalEvents.map(event => {
      return oracleContract
        .getRequest(
          event.args?.requester,
          event.args?.identifier,
          event.args?.timestamp,
          event.args?.ancillaryData
        )
        .then(result => {
          const isDisputed =
            result.disputer === '0x0000000000000000000000000000000000000000'
              ? false
              : true;

          const isExpired =
            Math.floor(Date.now() / 1000) >=
            Number(event.args?.expirationTimestamp);

          return {
            expirationTimestamp: event.args?.expirationTimestamp,
            isExpired: isExpired,
            isDisputed: isDisputed,
            isSettled: result.settled,
            resolvedPrice: result.resolvedPrice,
            proposalHash: proposalHash
          };
        });
    })
  );

  // If we add a ProposalExecuted event to the OptimisticGovernor, we could check by both the hash and the timestamp.
  // In its current form, this code will create issues if there are duplicate proposals.
  const executionEvents = await moduleContract.queryFilter(
    moduleContract.filters.TransactionExecuted(proposalHash)
  );
  const proposalExecuted = executionEvents.length > 0;
  return {
    dao: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    rules: moduleDetails[2][0],
    minimumBond: minimumBond,
    expiration: moduleDetails[4][0],
    allowance: bondDetails.currentUserBondAllowance,
    collateral: bondDetails.collateral,
    decimals: bondDetails.decimals,
    symbol: bondDetails.symbol,
    userBalance: bondDetails.currentUserBalance,
    needsBondApproval: needsApproval,
    proposalEvent: proposalEvent[0],
    proposalExecuted: proposalExecuted
  };
};
