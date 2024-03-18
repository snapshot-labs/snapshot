import { BigNumber } from "@ethersproject/bignumber";
import {
  Logger,
  createLoggingContext,
  ChainData,
  ajv,
  chainIdToDomain as _chainIdToDomain,
  domainToChainId as _domainToChainId,
  getConversionRate as _getConversionRate,
} from "@connext/nxtp-utils";
import { contractDeployments, ChainReader } from "@connext/nxtp-txservice";
import memoize from "memoizee";

export type logger = Logger;

import { calculateRelayerFee } from "./lib/helpers";
import { ParamsInvalid } from "./lib/errors";
import { SdkConfig, getConfig } from "./config";
import {
  SdkEstimateRelayerFeeParamsSchema,
  SdkEstimateRelayerFeeParams,
} from "./interfaces";

/**
 * @classdesc SDK class encapsulating bridge functions.
 *
 */
export class SdkBase {
  private static _instance: SdkBase;
  readonly config: SdkConfig;
  readonly chainData: Map<string, ChainData>;
  protected readonly logger: Logger;
  protected readonly chainreader: ChainReader;

  constructor(
    config: SdkConfig,
    logger: Logger,
    chainData: Map<string, ChainData>
  ) {
    this.config = config;
    this.logger = logger;
    this.chainData = chainData;
    this.chainreader = new ChainReader(
      logger.child({ module: "ChainReader" }, this.config.logLevel) as any,
      config.chains
    );
  }

  static async create(
    _config: SdkConfig,
    _logger?: Logger,
    _chainData?: Map<string, ChainData>
  ): Promise<SdkBase> {
    const { nxtpConfig, chainData } = await getConfig(
      _config,
      contractDeployments,
      _chainData
    );
    const logger = _logger
      ? _logger.child({ name: "SdkBase" })
      : new Logger({ name: "SdkBase", level: nxtpConfig.logLevel });

    return (
      this._instance ||
      (this._instance = new SdkBase(nxtpConfig, logger, chainData))
    );
  }

  getConversionRate = memoize(
    async (chainId: number) => {
      return await _getConversionRate(chainId, undefined, undefined);
    },
    { promise: true, maxAge: 1 * 60 * 1000 } // maxAge: 1 min
  );

  getChainId = memoize(
    async (domainId: string): Promise<number> => {
      let chainId = this.config.chains[domainId]?.chainId;
      if (!chainId) {
        chainId = _domainToChainId(+domainId);
      }
      return chainId;
    },
    { promise: true }
  );

  async estimateRelayerFee(
    params: SdkEstimateRelayerFeeParams
  ): Promise<BigNumber> {
    const { requestContext, methodContext } = createLoggingContext(
      this.estimateRelayerFee.name
    );
    this.logger.info("Method start", requestContext, methodContext, { params });

    // Input validation
    const validateInput = ajv.compile(SdkEstimateRelayerFeeParamsSchema);
    const validInput = validateInput(params);
    if (!validInput) {
      const msg = validateInput.errors
        ?.map((err: any) => `${err.instancePath} - ${err.message}`)
        .join(",");
      throw new ParamsInvalid({
        paramsError: msg,
        params,
      });
    }

    const [originChainId, destinationChainId] = await Promise.all([
      this.getChainId(params.originDomain),
      this.getChainId(params.destinationDomain),
    ]);

    const [originNativeTokenPrice, destinationNativeTokenPrice] =
      await Promise.all([
        params.originNativeTokenPrice
          ? Promise.resolve(params.originNativeTokenPrice)
          : this.getConversionRate(originChainId),
        params.destinationNativeTokenPrice
          ? Promise.resolve(params.destinationNativeTokenPrice)
          : this.getConversionRate(destinationChainId),
      ]);

    const relayerFeeInOriginNativeAsset = await calculateRelayerFee(
      {
        ...params,
        originChainId,
        destinationChainId,
        originNativeTokenPrice,
        destinationNativeTokenPrice,
        getGasPriceCallback: (domain: number) =>
          this.chainreader.getGasPrice(domain, requestContext),
      },
      this.chainData,
      this.logger,
      requestContext
    );

    return relayerFeeInOriginNativeAsset;
  }
}
