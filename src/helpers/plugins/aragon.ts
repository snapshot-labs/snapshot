// @ts-ignore
import abi from 'web3-eth-abi';
import agent from '../abi/Agent.json';

// Constants needed for the `encodeCallsScript` and `encodeAgentExecute` function
const CALLSCRIPT_ID = '0x00000001';
const EMPTY_HEX = '0x00';

// NOTE: This agent address corresponds to the test DAO 0x73e57bDBB9b154f2fddbFe302B8c4d8B318179bE,
// In a real setting, this address will be configured in the snapshot space, along with the
// disputable delay address.
const AGENT_ADDRESS = '0x1faab98418763b7b6a6634e8e3865bfdd15bd8ce';

function encodeCallsScript(actions) {
  return actions.reduce((script, { to, data }) => {
    // @ts-ignore
    const address = abi.encodeParameter('address', to);
    const dataLength = abi
      // @ts-ignore
      .encodeParameter('uint256', (data.length - 2) / 2)
      .toString('hex');
    return script + address.slice(26) + dataLength.slice(58) + data.slice(2);
  }, CALLSCRIPT_ID);
}

/**
 * Encodes an arbitrary agent action into a ready-to-use callsScript, sending 0 ETH.
 * The calldata is just an encoded function call which can be made wth abi.encodeFunctionCall,
 * using the web3-eth-abi package.
 * @param {string} targetAddress - The address that the agent will call.
 * @param {string} calldata - The calldata that the agent will use on the address.
 * @returns {string} callsScript - the agent function call, readily encoded into a callscript to be
 * used as payload for the disputable delay `delayExecution` call.
 */
function encodeAgentExecute(targetAddress, calldata) {
  const agentABI = agent.abi.filter(item => item.name === 'execute')[0];
  // @ts-ignore
  const agentAction = abi.encodeFunctionCall(agentABI, [
    targetAddress,
    EMPTY_HEX,
    calldata
  ]);
  return encodeCallsScript([{ to: AGENT_ADDRESS, data: agentAction }]);
}

export default class Plugin {
  public key = 'aragon';
  public version = '0.1.1';
  public name = 'Aragon Agreements';
  public website = 'https://aragon.org/agreements';
  public image =
    'https://raw.githubusercontent.com/balancer-labs/snapshot/develop/src/assets/aragon.svg';
  public options: any;

  execute(options) {
    return encodeAgentExecute(
      options.actions[0].targetAddress,
      options.actions[0].calldata
    );
  }
}
