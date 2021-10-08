import {
  SNAPSHOT_SUBGRAPH_URL,
  subgraphRequest
} from '@snapshot-labs/snapshot.js/src/utils';

export const contractAddress = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446';

export async function getDelegates(network, address, snapshot = 'latest') {
  const params = {
    delegations: {
      __args: {
        where: {
          delegator: address.toLowerCase()
        },
        first: 1000
      },
      space: true,
      delegate: true
    }
  };
  if (snapshot !== 'latest') {
    // @ts-ignore
    params.delegations.__args.block = { number: snapshot };
  }
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}

export async function getDelegators(network, address, snapshot = 'latest') {
  const params = {
    delegations: {
      __args: {
        where: {
          delegate: address.toLowerCase()
        },
        first: 1000
      },
      delegator: true,
      space: true
    }
  };
  if (snapshot !== 'latest') {
    // @ts-ignore
    params.delegations.__args.block = { number: snapshot };
  }
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}

export async function getDelegatesBySpace(network, space, snapshot = 'latest') {
  const params = {
    delegations: {
      __args: {
        where: {
          space
        },
        first: 1000
      },
      delegate: true,
      delegator: true
    }
  };
  if (snapshot !== 'latest') {
    // @ts-ignore
    params.delegations.__args.block = { number: snapshot };
  }
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}
