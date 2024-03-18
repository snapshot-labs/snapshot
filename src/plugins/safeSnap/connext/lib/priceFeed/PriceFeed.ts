import Coinbase from "./Coinbase";

const cache: {
  [tokenSymbol: string]: Promise<any> | null;
} = {};

const cacheTimestamps: {
  [tokenSymbol: string]: number | null;
} = {};

interface Service {
  getPriceByTokenSymbol(symbol: string): Promise<number>;
}

class PriceFeed {
  cacheTimeMs = 5 * 60 * 1000;
  service: Service;

  aliases: { [tokenSymbol: string]: string } = {
    WETH: "ETH",
    WMATIC: "MATIC",
    XDAI: "DAI",
    WXDAI: "DAI",
  };

  constructor() {
    this.service = new Coinbase();
  }

  async getPriceByTokenSymbol(tokenSymbol: string) {
    // "USDC-USD" doesn't exist on coinbase api
    if (tokenSymbol === "USDC") {
      return 1;
    }

    if (this.aliases[tokenSymbol]) {
      tokenSymbol = this.aliases[tokenSymbol];
    }
    if ((await cache[tokenSymbol]) && cacheTimestamps[tokenSymbol]) {
      const isRecent =
        cacheTimestamps[tokenSymbol]! > Date.now() - this.cacheTimeMs;
      if (isRecent) {
        return cache[tokenSymbol];
      }
    }
    try {
      const price = this.service.getPriceByTokenSymbol(tokenSymbol);
      if (price === null) {
        throw new Error(`null price for ${tokenSymbol}`);
      }
      cache[tokenSymbol] = price;
      cacheTimestamps[tokenSymbol] = Date.now();
      return price;
    } catch (err: any) {
      throw new Error(`PriceFeed error: ${err.message}`);
    }
  }
}

export default PriceFeed;
