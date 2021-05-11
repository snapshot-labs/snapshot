import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export async function proposalQuery(query) {
  const response = await subgraphRequest(
    `${process.env.VUE_APP_HUB_URL}/graphql`,
    {
      proposal: query
    }
  );
  return response.proposal;
}
