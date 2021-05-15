import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export async function proposalQuery(id) {
  const response = await subgraphRequest(
    `${process.env.VUE_APP_HUB_URL}/graphql`,
    {
      proposal: {
        __args: {
          id
        },
        id: true,
        title: true,
        body: true,
        choices: true,
        start: true,
        end: true,
        snapshot: true,
        state: true,
        author: true,
        created: true,
        plugins: true,
        network: true,
        strategies: {
          name: true,
          params: true
        },
        space: {
          id: true,
          name: true
        }
      }
    }
  );
  return response.proposal;
}
