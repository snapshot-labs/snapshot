import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import {
  Fragment,
  FunctionFragment,
  Interface,
  ParamType,
  defaultAbiCoder
} from '@ethersproject/abi';
import { Contract, ContractInterface } from '@ethersproject/contracts';
// import { Contract, ContractInterface } from '@ethersproject';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { CONNEXT_MODULE_ABI, getConstants } from '../constants';
import { ConnextModDetails } from '../types/connext';
import { encodeFunction } from './encodeFunction';
import { getParams } from './getParams';
import { encodeReceiverCallData } from './encodeReceiverCalldata';
import { encodeXCall } from './encodeXCall';
import { getDestinationProvider } from './getDestinationProvider';
import { estimateRelayerFee } from './estimateRelayerFee';
import { getTransactionJson } from './getTransactionJson';
import { SafeDetails, SafeTransaction } from '@/helpers/interfaces';
import { connextModuleTransaction } from './transactions';
import Plugin from '../index';
import { BigNumber } from '@ethersproject/bignumber';
import { hexlify } from '@ethersproject/bytes';
import { APPROVE_ABI, encodeApprove } from './encodeApprove';

interface CallData {
  type: string;
  value: string;
}

export interface ContractTransactionData {
  to: string;
  value: string;
  data: string;
  name: string;
  calldatas: CallData[];
}

interface ConnextTransactionParams {
  destinationChain: {
    network?: string | undefined;
    dao: string;
    connext: string;
    domainId: number;
    originSender: string;
    owner: string;
  };
  destinationSafeSelected: SafeDetails;
  abi: Fragment[];
  method: FunctionFragment;
  parameters: string[];
  contractAddress: string;
  originSafeAddress: string;
  originChain: string;
  nonce: number;
}

const { Chains } = getConstants();

export const getModuleDetailsConnext = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string
): Promise<ConnextModDetails> => {
  let moduleDetails;
  try {
    // Assume module is Connext Module
    moduleDetails = await multicall(network, provider, CONNEXT_MODULE_ABI, [
      [moduleAddress, 'avatar'],
      [moduleAddress, 'connext'],
      [moduleAddress, 'origin'],
      [moduleAddress, 'originSender'],
      [moduleAddress, 'owner']
    ]);
  } catch (err) {
    console.error(err);
  }
  return {
    dao: moduleDetails[0][0],
    connext: moduleDetails[1][0],
    domainId: moduleDetails[2][0],
    originSender: moduleDetails[3][0],
    owner: moduleDetails[4][0]
  };
};

const getMethodSignature = (method: FunctionFragment) => {
  const name = method.name;
  const types = method.inputs.map(input => input.type).join(',');
  return `${name}(${types})`;
};

const getOriginChainKey = (originChain: string) => {
  for (const key in Chains) {
    if (Chains.hasOwnProperty(key)) {
      if (Chains[key].id === parseInt(originChain)) {
        return key;
      }
    }
  }
};
const getDomainIdById = (chain: string): number | undefined => {
  const chainId = parseInt(chain);
  for (const chainKey in Chains) {
    if (Chains.hasOwnProperty(chainKey)) {
      const chain = Chains[chainKey];
      if (chain.id === chainId) {
        return chain.domainId;
      }
    }
  }
  return undefined;
};

export const getChainIdByDomainId = (chain: string): number | undefined => {
  const chainId = parseInt(chain);
  for (const chainKey in Chains) {
    if (Chains.hasOwnProperty(chainKey)) {
      const chain = Chains[chainKey];
      if (chain.domainId === chainId) {
        return chain.id;
      }
    }
  }
  return undefined;
};

export const encodeDestinationTx = (
  abi: string,
  selectedMethod: FunctionFragment,
  parameters: string[],
  contractAddress: string
) => {
  const contractInterface = new Interface(abi);
  const methodSignature = getMethodSignature(selectedMethod);
  const encodedFunction = encodeFunction(
    contractInterface,
    selectedMethod,
    parameters
  );
  return {
    contractAddress: contractAddress,
    abiItem: abi,
    method: selectedMethod,
    methodSignature,
    encodedTx: encodedFunction,
    params: parameters
  };
};

const getApproveTx = (
  methodSignature: string,
  encodedTx: string,
  contractAddress: string,
  nonce: number
) => {
  const name = methodSignature;
  const data = encodedTx;
  return {
    to: contractAddress,
    value: '0',
    data: data || '',
    name: name || '',
    nonce
  };
};

const getDestinationTxData = (
  methodSignature: string,
  encodedTx: string,
  selectedMethod: FunctionFragment,
  parameters: string[],
  contractAddress: string,
  txValue?: string
): ContractTransactionData => {
  const name = methodSignature;
  const data = encodedTx;
  const calldatas = getParams(
    selectedMethod as FunctionFragment,
    parameters || []
  );
  return {
    to: contractAddress,
    value: txValue || '0',
    data: data || '',
    name: name || '',
    calldatas
  };
};

const getReceiverCallData = (destinationTxData: ContractTransactionData) => {
  const receiverCalldata = encodeReceiverCallData(
    destinationTxData.to,
    destinationTxData.value,
    destinationTxData.data
  );

  return receiverCalldata;
};

const getXCallsParams = (
  originSender: string,
  originChain: string,
  destinationChain: string,
  destinationParams: ContractTransactionData,
  connextZodiacMod: string,
  relayerFee: string
) => {
  const originChainKey: string = getOriginChainKey(originChain) ?? '';
  const to = connextZodiacMod;
  const asset =
    Chains[originChainKey].assets.WETH || Chains[originChainKey].assets.TEST;
  const destinationDomainId = getDomainIdById(destinationChain) ?? '';
  const calldata = getReceiverCallData(destinationParams);
  /* xCallParams:
      0: destination domaninId
      1: to (ZodiacConnextModule | ZodiacConnextModuleFactory)
      2: asset
      3: delegate
      4: amount
      5: slippage
      6: callData
    */
  const xCallParams: string[] = [
    destinationDomainId.toString(),
    to, //e.g:Zodiac mod deployed en Gnosis chain to,
    asset,
    originSender,
    '0',
    '0',
    calldata
  ];
  const { encodedData, params, signature } = encodeXCall(xCallParams);

  const xCallJson = {
    name: signature,
    value: relayerFee,
    to: Chains[originChainKey].connextContract,
    from: originSender, //userAddress,
    data: encodedData,
    calldatas: params
  };

  return { xCallParams, xCallJson };
};

const findChainKeyNameById = (id: number): string | undefined => {
  const chainKey = Object.keys(Chains).find(key => Chains[key].id === id);
  return chainKey;
};

interface RelayerFeeResponse {
  txResult: {
    to: string;
    from: string;
    data: string;
    value: string;
    type: string;
  };
  xCallJson: ContractTransactionData;
}
const getRelayerFee = async (
  destinationTxData: ContractTransactionData,
  destinationChain: string,
  originSender: string,
  originChain: string,
  connextZodiacMod: string
): Promise<RelayerFeeResponse | undefined> => {
  const destinyChainName: string =
    findChainKeyNameById(parseInt(destinationChain)) ?? '';
  const originChainName: string =
    findChainKeyNameById(parseInt(originChain)) ?? '';
  const destinyProvider = getDestinationProvider(destinyChainName);
  const txGasLimit = (
    await destinyProvider.estimateGas({
      to: destinationTxData.to,
      value: destinationTxData.value,
      data: destinationTxData.data,
      from: originSender
    })
  ).toNumber();
  const response = await estimateRelayerFee({
    originChain: originChainName, //e.g polygon
    destinyChain: destinyChainName, //e.g gnosisChain
    txGasLimit
  })
    .then(rFee => {
      const { xCallJson } = getXCallsParams(
        originSender,
        originChain,
        destinationChain,
        destinationTxData,
        connextZodiacMod,
        rFee
      );
      const txResult = getTransactionJson(xCallJson);
      return { txResult, xCallJson };
    })

    .catch(e => {
      console.error('Error: ', e);
    });
  if (response) {
    return {
      txResult: {
        ...response.txResult,
        type: 'connext',
        from: response.xCallJson.from
      },
      xCallJson: response.xCallJson
    };
  }
  return;
};

export const generateConnextTransaction = async ({
  destinationChain,
  destinationSafeSelected,
  abi,
  method,
  parameters,
  contractAddress,
  originSafeAddress,
  originChain,
  nonce
}: ConnextTransactionParams): Promise<SafeTransaction | undefined> => {
  const plugin = new Plugin();
  const destinationTx = encodeDestinationTx(
    JSON.stringify(abi),
    method,
    parameters,
    contractAddress
  );
  const destinationTxData = getDestinationTxData(
    destinationTx.methodSignature,
    destinationTx.encodedTx,
    method,
    parameters,
    contractAddress
  );

  const tx = await getRelayerFee(
    destinationTxData,
    destinationChain?.network ?? '',
    originSafeAddress,
    originChain,
    destinationSafeSelected?.connextAddress ?? ''
  );
  if (tx) {
    const { txResult, xCallJson } = tx;
    const transaction = connextModuleTransaction({
      value: txResult.value,
      to: txResult.to,
      data: txResult.data,
      nonce: nonce.toString(),
      type: txResult.type,
      method,
      destinationTx: destinationTxData,
      originTx: xCallJson,
      destinationChain: destinationChain?.network ?? '',
      zodiacMod: destinationSafeSelected?.connextAddress ?? ''
    });
    if (plugin.validateTransaction(transaction)) {
      console.log('Connext transaction:', transaction);
      return transaction;
    }
  }
};

export const decodeConnextTransaction = async (data: string, abi: string) => {
  const connextInterface = new Interface(abi);
  console.log('connextInterface', connextInterface);
  console.log('data', data);
  const decoded = connextInterface.parseTransaction({ data });
  console.log('decoded', decoded);
};

export function prepareERC20BridgeTransaction({
  tokenAddress,
  amount,
  recipient,
  destinationDomain,
  slippage,
  relayerFee,
  signerAddress,
  nonce
}: {
  tokenAddress: string;
  amount: string;
  recipient: string;
  destinationDomain: number;
  slippage: number;
  relayerFee: string;
  signerAddress: string;
  nonce: number;
}) {
  /* 
    Approve Params:
      0: spender
      1: amount
    */
  const approveParams: string[] = [Chains['polygon'].connextContract, amount];
  const { encodedData, signature } = encodeApprove(approveParams);
  const approveTx = getApproveTx(signature, encodedData, tokenAddress, nonce);
  const xCallParams: string[] = [
    destinationDomain.toString(),
    recipient, //e.g:To address will be received the funds,
    tokenAddress, //asset,
    signerAddress, // Origin address in this case the safe
    amount,
    slippage.toString(),
    '0x' //call data empty because is a simple transaction
  ];
  const {
    encodedData: xCallEncodedData,
    params,
    signature: xCallSignature
  } = encodeXCall(xCallParams);
  const xCallJson = {
    name: xCallSignature,
    value: relayerFee,
    to: Chains['polygon'].connextContract,
    from: signerAddress, //userAddress,
    data: xCallEncodedData,
    calldatas: params,
    nonce: nonce + 1
  };

  return {
    approveTx,
    xCallJson
  };
}

export async function prepareETHBridgeTransaction({
  wethAddress,
  wethAbi,
  connextAbi,
  amount,
  recipient,
  destinationDomain,
  slippage,
  relayerFee,
  provider,
  signerAddress,
  connextAddress
}: {
  wethAddress: string;
  wethAbi: string;
  connextAbi: string;
  amount: string;
  recipient: string;
  destinationDomain: number;
  slippage: number;
  relayerFee: string;
  provider: StaticJsonRpcProvider;
  signerAddress: string;
  connextAddress: string;
}): Promise<any | undefined> {
  const wethContract = new Contract(wethAddress, wethAbi, provider);
  const connextContract = new Contract(connextAddress, connextAbi, provider);

  // 1. Preparar la transacción para depositar en WETH
  const depositTx = wethContract.populateTransaction.deposit({ value: amount });

  // 2. Preparar la transacción de aprobación si es necesario
  const allowance = await wethContract.allowance(signerAddress, connextAddress);
  let approveTxData: string | undefined;
  if (allowance.lt(BigNumber.from(amount))) {
    const approveTx = await wethContract.populateTransaction.approve(
      connextAddress,
      MaxUint256
    );
    approveTxData = approveTx.data ?? undefined;
  }

  // 3. Preparar la transacción xcall
  const xCallTx = await connextContract.populateTransaction.xcall(
    destinationDomain,
    recipient,
    wethAddress,
    signerAddress,
    amount,
    slippage,
    defaultAbiCoder.encode(['address'], [recipient]),
    { value: relayerFee }
  );

  // Ajusta el tipo de retorno según tus necesidades
  return {
    depositTx,
    approveTxData,
    xCallTx
  };
}
