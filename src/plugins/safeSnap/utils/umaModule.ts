import { ref } from 'vue';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { UMA_MODULE_ABI, ERC20_ABI } from '../constants';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { useWeb3 } from '@/composables';

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

export const getModuleDetails = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string
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
}> => {
  const moduleDetails = await multicall(network, provider, UMA_MODULE_ABI, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracle'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);
  const bondDetails = await getBondDetails(provider, moduleAddress);
  return {
    dao: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    rules: moduleDetails[2][0],
    minimumBond: moduleDetails[3][0],
    expiration: moduleDetails[4][0],
    allowance: bondDetails.currentUserBondAllowance,
    collateral: bondDetails.collateral,
    decimals: bondDetails.decimals,
    symbol: bondDetails.symbol,
    userBalance: bondDetails.currentUserBalance
  };
};
