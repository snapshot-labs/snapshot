import { computed, ref, watch } from 'vue';
import { getNativeCoinInfo, ModuleExecutionData } from '@/helpers/safe';
import REALITY_ORACLE_ERC_ABI from '@/helpers/abi/REALITY_ORACLE_ERC.json';
import REALITY_ORACLE_ETH_ABI from '@/helpers/abi/REALITY_ORACLE_ETH.json';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { Contract } from '@ethersproject/contracts';
import { HashZero } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';
import { Proposal } from '@/helpers/interfaces';
import { useWeb3 } from '@/composables';

export async function useExecutorRealityOracle(
  executionData: ModuleExecutionData,
  proposal: Proposal,
  oracleAddress: string,
  questionId: string,
  minimumBond: BigNumber
) {
  const readProvider = getProvider(executionData.safe.network);
  const { web3Account } = useWeb3();

  const { oracleContract, bondContract, bondDecimals, bondSymbol } =
    await detectOracleAndBondToken(oracleAddress);

  const oracleAnswer = ref<boolean>(false);
  const isOracleAnswerFinal = ref<boolean>(false);
  const oracleAnswerFinalizedAt = ref<number>(0);

  const bondAllowance = ref<BigNumber>(BigNumber.from(0));
  const bondCurrentAmount = ref<BigNumber>(BigNumber.from(0));
  const bondNextAmount = computed<BigNumber>(() => {
    // RealityModule can have 0 minimumBond, if it happens, the minimum bond will be 1 token
    if (bondCurrentAmount.value.eq(0)) {
      return minimumBond.eq(0) ? parseUnits('1', bondDecimals) : minimumBond;
    } else {
      return bondCurrentAmount.value.mul(2);
    }
  });
  const withdrawableUserBondBalance = ref<BigNumber>(BigNumber.from(0));

  const involvedUsers = ref<string[]>([]);
  const placedBonds = ref<BigNumber[]>([]);
  const givenAnswers = ref<boolean[]>([]);
  const answerHistoryHashes = ref<string[]>([]);

  async function detectOracleAndBondToken(oracleAddress: string) {
    // A reality module is connected to an oracle accepting either an ERC20 or ETH as a bond.
    // There is no way to tell with which one we are dealing, other than trying to call the token() method.
    // If this fails, it's an ETH-based oracle, otherwise ERC20 and we have the address of the bond token.

    // assume an ERC20 oracle first (with the token() method in the ABI)
    let oracleContract = new Contract(
      oracleAddress,
      REALITY_ORACLE_ERC_ABI,
      readProvider
    );

    let bondAddress: string | null = null;
    let bondContract: Contract | null = null;

    let { decimals: bondDecimals, symbol: bondSymbol } = getNativeCoinInfo(
      executionData.safe.network
    );

    try {
      bondAddress = (await oracleContract.token()) as string;
      bondContract = new Contract(bondAddress, ERC20_ABI, readProvider);
      bondDecimals = await bondContract.decimals();
      bondSymbol = await bondContract.symbol();
    } catch {
      // replace contract ABI with ETH-based one
      oracleContract = new Contract(
        oracleAddress,
        REALITY_ORACLE_ETH_ABI,
        readProvider
      );
    }

    return {
      oracleContract,
      bondContract,
      bondDecimals,
      bondSymbol
    };
  }

  async function updateOracleAnswer() {
    oracleAnswer.value =
      (await oracleContract.getBestAnswer(questionId)) !== HashZero;
    isOracleAnswerFinal.value = await oracleContract.isFinalized(questionId);
    oracleAnswerFinalizedAt.value = await oracleContract.getFinalizeTS(
      questionId
    );
  }

  async function updateDisputeHistory() {
    const answerEvents = await oracleContract.queryFilter(
      oracleContract.filters.LogNewAnswer(null, questionId),
      parseInt(proposal.snapshot)
    );

    involvedUsers.value = [];
    answerHistoryHashes.value = [];
    placedBonds.value = [];
    givenAnswers.value = [];

    // We need to send the information from last to first
    answerEvents.reverse();
    answerEvents.forEach(({ args }) => {
      if (!args) return;
      const { user, history_hash, bond, answer } = args;

      involvedUsers.value.push(user.toLowerCase());
      answerHistoryHashes.value.push(history_hash);
      placedBonds.value.push(bond);
      givenAnswers.value.push(answer);
    });

    // Remove the first history and add an empty one
    // More info: https://github.com/realitio/realitio-contracts/blob/master/truffle/contracts/Realitio.sol#L502
    answerHistoryHashes.value.shift();
    answerHistoryHashes.value.push(HashZero);
  }

  async function updateBondInfo() {
    bondCurrentAmount.value = BigNumber.from(
      await oracleContract.getBond(questionId)
    );
    withdrawableUserBondBalance.value = BigNumber.from(
      await oracleContract.balanceOf(web3Account.value)
    );
  }

  async function setBondAllowance() {
    bondAllowance.value = BigNumber.from(
      bondContract && web3Account.value
        ? await bondContract.allowance(web3Account.value, oracleAddress)
        : 0
    );
  }

  watch(web3Account, setBondAllowance);

  return {
    oracleContract,
    oracleAnswer,
    isOracleAnswerFinal,
    oracleAnswerFinalizedAt,
    bondContract,
    bondDecimals,
    bondSymbol,
    bondAllowance,
    bondNextAmount,
    answerHistoryHashes,
    involvedUsers,
    placedBonds,
    givenAnswers,
    updateOracleAnswer,
    updateDisputeHistory,
    updateBondInfo
  };
}
