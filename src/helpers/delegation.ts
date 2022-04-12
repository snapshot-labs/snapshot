import {
  SNAPSHOT_SUBGRAPH_URL,
  subgraphRequest
} from '@snapshot-labs/snapshot.js/src/utils';

export const contractAddress = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446';

export async function getDelegates(network: string, address: string) {
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
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}

export async function getDelegators(network: string, address: string) {
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
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}

export async function getDelegatesBySpace(
  network: string,
  space: string,
  snapshot = 'latest'
) {
  const spaceIn = ['', space];
  if (space.includes('.eth')) spaceIn.push(space.replace('.eth', ''));

  const PAGE_SIZE = 1000;
  let result = [];
  let page = 0;
  const params: any = {
    delegations: {
      __args: {
        where: {
          space_in: spaceIn
        },
        first: PAGE_SIZE,
        skip: 0
      },
      delegator: true,
      space: true,
      delegate: true
    }
  };
  if (snapshot !== 'latest') {
    params.delegations.__args.block = { number: snapshot };
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    params.delegations.__args.skip = page * PAGE_SIZE;

    const pageResult = await subgraphRequest(
      SNAPSHOT_SUBGRAPH_URL[network],
      params
    );
    const pageDelegations = pageResult.delegations || [];
    result = result.concat(pageDelegations);
    page++;
    if (pageDelegations.length < PAGE_SIZE) break;
  }

  // Global delegations are null in decentralized subgraph
  page = 0;
  delete params.delegations.__args.where.space_in;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    params.delegations.__args.skip = page * PAGE_SIZE;
    params.delegations.__args.where.space = null;
    const pageResult = await subgraphRequest(
      SNAPSHOT_SUBGRAPH_URL[network],
      params
    );

    const pageDelegations = pageResult.delegations || [];
    result = result.concat(pageDelegations);
    page++;
    if (pageDelegations.length < PAGE_SIZE) break;
  }
  return result;
}
