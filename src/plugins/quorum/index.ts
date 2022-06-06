import { BigNumber } from '@ethersproject/bignumber';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { getSnapshots } from '@snapshot-labs/snapshot.js/src/utils/blockfinder';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export default class Plugin {
  public author = 'lbeder';
  public version = '0.1.0';
  public name = 'Quorum';

  /**
   * Returns the total voting power at specific snapshot
   */
  async getTotalVotingPower(web3: any, quorumOptions: any, snapshot: string) {
    const { strategy } = quorumOptions;

    switch (strategy) {
      case 'static': {
        return quorumOptions.total;
      }

      case 'balance': {
        const { address, methodABI, decimals } = quorumOptions;

        const blockTag = snapshot === 'latest' ? snapshot : parseInt(snapshot);

        const totalVotingPower = await call(
          web3,
          [methodABI],
          [address, methodABI.name],
          { blockTag }
        );

        return BigNumber.from(totalVotingPower)
          .div(BigNumber.from(10).pow(decimals))
          .toNumber();
      }

      case 'multichainBalance': {
        const { network, strategies, quorumModifier } = quorumOptions;
        const blocks = await getSnapshots(
          network,
          parseInt(snapshot),
          web3,
          strategies.map(s => s.network || network)
        );
        const requests: Promise<any>[] = strategies.map(s =>
          call(
            getProvider(s.network),
            [s.methodABI],
            [s.address, s.methodABI.name],
            { blockTag: blocks[s.network] }
          )
        );
        const results = await Promise.all(requests);
        const totalBalance = results.reduce((total, ele, index) => {
          const eleDecimals = strategies[index].decimals;
          if (index === 1) {
            const eleDecimals = strategies[0].decimals;
            total = total.div(BigNumber.from(10).pow(eleDecimals));
          }
          return total.add(ele.div(BigNumber.from(10).pow(eleDecimals)));
        });
        const modifier = quorumModifier ? quorumModifier : 1;
        return totalBalance.toNumber() * modifier;
      }

      default:
        throw new Error(`Unsupported quorum strategy: ${strategy}`);
    }
  }
}
