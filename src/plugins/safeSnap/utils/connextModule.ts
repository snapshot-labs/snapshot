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
import {
  CONNEXT_MODULE_ABI,
  findChainKeyById,
  getConstants
} from '../constants';
import { ConnextModDetails } from '../types/connext';
import { encodeFunction } from './encodeFunction';
import { getParams } from './getParams';
import {
  encodeReceiverCallData,
  encodeRecipientCallData
} from './encodeReceiverCalldata';
import { encodeXCall } from './encodeXCall';
import { getDestinationProvider } from './getDestinationProvider';
import { estimateRelayerFee } from './estimateRelayerFee';
import { getTransactionJson } from './getTransactionJson';
import {
  CustomConnextTransaction,
  SafeDetails,
  SafeTransaction
} from '@/helpers/interfaces';
import { connextModuleTransaction } from './transactions';
import Plugin, { createMultiSendTx } from '../index';
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

interface ConnextSimpleBridgeParams {
  originChainId: number;
  assetAddress: string;
  amount: string;
  destinationAddress: string;
  destinationChainId: string;
  slippage: number;
  relayerFee?: string;
  originSafeAddress: string;
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

export const getChainByDomainId = (domainId: number) => {
  const chainId = domainId;
  for (const chainKey in Chains) {
    if (Chains.hasOwnProperty(chainKey)) {
      const chain = Chains[chainKey];
      if (chain.domainId === chainId) {
        return chain;
      }
    }
  }
  return undefined;
};

export const findAssetKeyByAddress = (address: string) => {
  for (const chain in Chains) {
    const assets = Chains[chain].assets;
    for (const key in assets) {
      if (assets[key] === address) {
        return { chain: chain, assetKey: key };
      }
    }
  }
  return null;
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
    operation: '0',
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
  const domainIdId = getDomainIdById(destinationChain) ?? '';
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
    domainIdId.toString(),
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
      return transaction;
    }
  }
};

const getSimpleBridgeTransaction = (
  connextTx,
  multiSendTx,
  params: ConnextSimpleBridgeParams
): CustomConnextTransaction => {
  return {
    type: 'connext',
    abi: [],
    destinationTx: undefined,
    originTx: connextTx.xCallJson,
    approveTx: connextTx.approveTx,
    amount: parseInt(params.amount),
    data: multiSendTx.data,
    to: multiSendTx.to,
    destinationChain: params.destinationChainId,
    zodiacMod: '',
    value: multiSendTx.value,
    operation: multiSendTx.operation,
    nonce: multiSendTx.nonce
  };
};

function prepareERC20BridgeTransaction({
  originChainId,
  assetAddress,
  amount,
  destinationAddress,
  destinationChainId,
  slippage,
  originSafeAddress,
  relayerFee,
  nonce
}: ConnextSimpleBridgeParams) {
  const domainId = getDomainIdById(destinationChainId);
  const originChainName: string = findChainKeyById(Chains, originChainId) ?? '';
  const connextAddress = Chains[originChainName].connextContract;
  if (domainId) {
    /* 
      Approve Params:
        0: spender address connext address
        1: amount
      */
    const approveParams: string[] = [connextAddress, amount];
    const { encodedData, signature } = encodeApprove(approveParams);
    const approveTx = getApproveTx(signature, encodedData, assetAddress, nonce);
    const xCallParams: string[] = [
      domainId.toString(),
      destinationAddress, //e.g:To address will be received the funds,
      assetAddress, //asset,
      originSafeAddress, // Origin address in this case the safe
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
      to: Chains[originChainName].connextContract,
      from: originSafeAddress, //userAddress,
      data: xCallEncodedData,
      calldatas: params,
      operation: '0',
      nonce: nonce
    };
    return {
      approveTx,
      xCallJson
    };
  }
}

function prepareNativeBridgeTransaction({
  originChainId,
  assetAddress,
  amount,
  destinationAddress,
  destinationChainId,
  slippage,
  originSafeAddress,
  relayerFee,
  nonce
}: ConnextSimpleBridgeParams) {
  const domainId = getDomainIdById(destinationChainId);
  if (domainId) {
    const destinyChain = getChainByDomainId(domainId ?? 0);

    if (destinyChain) {
      const originChainName: string =
        findChainKeyById(Chains, originChainId) ?? '';
      const connextAddress = Chains[originChainName].connextContract;
      const weth = assetAddress;
      const destinationUnwrapper = destinyChain.assets.WETH;
      const calldata = encodeRecipientCallData(destinationAddress);
      /* 
        Approve Params:
          0: spender address connext address
          1: amount
        */
      const approveParams: string[] = [connextAddress, amount];
      const { encodedData, signature } = encodeApprove(approveParams);
      const approveTx = getApproveTx(
        signature,
        encodedData,
        assetAddress,
        nonce
      );

      const xCallParams: string[] = [
        domainId.toString(),
        destinationUnwrapper, //e.g: _to: Unwrapper contract,
        weth, //asset,
        originSafeAddress, // _delegate: Origin address in this case the safe
        amount, // _amount: amount of tokens to transfer
        slippage.toString(),
        calldata //_callData: calldata with encoded recipient address
      ];
      const {
        encodedData: xCallEncodedData,
        params,
        signature: xCallSignature
      } = encodeXCall(xCallParams);
      const xCallJson = {
        name: xCallSignature,
        value: relayerFee,
        to: Chains[originChainName].connextContract,
        from: originSafeAddress, //userAddress,
        data: xCallEncodedData,
        calldatas: params,
        operation: '0',
        nonce: nonce
      };
      return {
        approveTx,
        xCallJson
      };
    }
  }
}

const connextNativeTransaction = (
  params: ConnextSimpleBridgeParams,
  multiSendAddress: string,
  isNative: boolean
) => {
  const connextTransaction = isNative
    ? prepareNativeBridgeTransaction(params)
    : prepareERC20BridgeTransaction(params);
  if (connextTransaction) {
    const multiSendTx = createMultiSendTx(
      [connextTransaction.approveTx as any, connextTransaction.xCallJson],
      params.nonce,
      multiSendAddress
    );

    return getSimpleBridgeTransaction(connextTransaction, multiSendTx, params);
  }
};

export const generateSimpleBridgeTransaction = (
  params: ConnextSimpleBridgeParams,
  isNative: boolean,
  multiSendAddress: string
) => {
  return connextNativeTransaction(params, multiSendAddress, isNative);
};
