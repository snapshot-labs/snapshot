import { BigNumber } from "@ethersproject/bignumber";
import { Type, Static } from "@sinclair/typebox";
import { TAddress, TIntegerString } from "@connext/nxtp-utils";

export type Pool = {
  domainId: string;
  name: string;
  symbol: string; // in the form of <TKN>-next<TKN>
  local: PoolAsset;
  adopted: PoolAsset;
  lpTokenAddress: string;
  canonicalHash: string; // hash of the domain and canonicalId, AKA "key"
  swapFee: string;
  adminFee: string;
  address?: string; // address of the pool contract, no address if internal pool
};

export type PoolAsset = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  index: number;
  balance: BigNumber;
};

export type AssetData = {
  local: string;
  adopted: string;
  canonical_id: string;
  canonical_domain: string;
  domain: string;
  key: string;
  id: string;
};

export type ConnextSupport = {
  name: string;
  chainId: number;
  domainId: string;
  assets: string[];
};

export const SdkXCallParamsSchema = Type.Object({
  origin: TIntegerString,
  destination: TIntegerString,
  to: TAddress,
  asset: Type.Optional(TAddress),
  delegate: Type.Optional(TAddress),
  amount: Type.Optional(TIntegerString),
  slippage: Type.Optional(TIntegerString),
  callData: Type.Optional(Type.String()),
  relayerFee: Type.Optional(TIntegerString),
  relayerFeeInTransactingAsset: Type.Optional(Type.String()),
  receiveLocal: Type.Optional(Type.Boolean()),
  wrapNativeOnOrigin: Type.Optional(Type.Boolean()),
  unwrapNativeOnDestination: Type.Optional(Type.Boolean()),
});

export type SdkXCallParams = Static<typeof SdkXCallParamsSchema>;

export const SdkBumpTransferParamsSchema = Type.Object({
  domainId: TIntegerString,
  transferId: Type.String(),
  asset: Type.String(),
  relayerFee: TIntegerString,
});

export type SdkBumpTransferParams = Static<typeof SdkBumpTransferParamsSchema>;

export const SdkUpdateSlippageSchema = Type.Object({
  domainId: TIntegerString,
  transferId: Type.String(),
  slippage: TIntegerString,
});

export type SdkUpdateSlippage = Static<typeof SdkUpdateSlippageSchema>;

export const SdkEstimateRelayerFeeParamsSchema = Type.Object({
  originDomain: TIntegerString,
  destinationDomain: TIntegerString,
  callDataGasAmount: Type.Optional(Type.Integer()),
  priceIn: Type.Optional(
    Type.Union([Type.Literal("native"), Type.Literal("usd")])
  ),
  isHighPriority: Type.Optional(Type.Boolean()),
  originNativeTokenPrice: Type.Optional(Type.Number()),
  destinationNativeTokenPrice: Type.Optional(Type.Number()),
  destinationGasPrice: Type.Optional(Type.String()),
});

export type SdkEstimateRelayerFeeParams = Static<
  typeof SdkEstimateRelayerFeeParamsSchema
>;

export const SdkUpdateSlippageParamsSchema = Type.Object({
  domainId: TIntegerString,
  transferId: Type.String(),
  slippage: TIntegerString,
});

export type SdkUpdateSlippageParams = Static<
  typeof SdkUpdateSlippageParamsSchema
>;

export const SdkCalculateAmountReceivedParamsSchema = Type.Object({
  originDomain: Type.String(),
  destinationDomain: Type.String(),
  originTokenAddress: Type.String(),
  amount: Type.String(),
  receiveLocal: Type.Optional(Type.Boolean()),
  checkFastLiquidity: Type.Optional(Type.Boolean()),
});

export type SdkCalculateAmountReceivedParams = Static<
  typeof SdkUpdateSlippageParamsSchema
>;

export type RouterBalance = {
  address: string;
  asset_canonical_id: string;
  asset_domain: string;
  router_address: string;
  balance: number;
  local: string;
  adopted: string;
  canonical_id: string;
  canonical_domain: string;
  domain: string;
  key: string;
  id: string;
  fees_earned: number;
};
