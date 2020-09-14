import abi from 'web3-eth-abi';

const CALLSCRIPT_ID = '0x00000001';

function encodeCallsScript(actions) {
  return actions.reduce((script, { to, data }) => {
    // @ts-ignore
    const address = abi.encodeParameter('address', to);
    const dataLength = abi
      // @ts-ignore
      .encodeParameter('uint256', (data.length - 2) / 2)
      .toString();
    return script + address.slice(26) + dataLength.slice(58) + data.slice(2);
  }, CALLSCRIPT_ID);
}

export default class Plugin {
  public key = 'aragon';
  public name = 'Aragon Agreements';
  public website = 'https://aragon.org/agreements';
  public image =
    'https://raw.githubusercontent.com/balancer-labs/snapshot/develop/src/assets/aragon.svg';
  public options: any;

  execute(options) {
    return encodeCallsScript(options.actions);
  }
}
