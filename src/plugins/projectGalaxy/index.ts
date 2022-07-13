// URLS
// const API_BASE_URL = 'https://graphigo.stg.galaxy.eco/query';
const API_BASE_URL = 'https://graphigo.prd.galaxy.eco/query';

export default class Plugin {
  async fetchGQL({ query, variables }) {
    return await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
  }

  async getOATImage(campaignId) {
    const response = await this.fetchGQL({
      query: `query getOATImage($id: ID!) {
        campaign(id: $id) {
          thumbnail
        }
      }`,
      variables: {
        id: campaignId
      }
    });
    if (!response.ok) {
      return '';
    }
    const resultJSON = await response.json();
    const { thumbnail } = resultJSON.data.campaign;
    return thumbnail;
  }

  async getCurrentState(snapshot, address, campaign) {
    // Fetch the event
    const eventResponse = await this.fetchGQL({
      query: `query getCurrentState($input: SnapshotClaimStatusInput!) {
        snapshotClaimStatus(input: $input) {
          status
        }
      }`,
      variables: {
        input: {
          address,
          campaign,
          proposalId: snapshot
        }
      }
    });
    // If the fetch fails: the event doesn't exists for this poap yet
    if (!eventResponse.ok) {
      return { currentState: 'NO_OAT' };
    }
    // Get the status from the event
    const responseJSON = await eventResponse.json();
    const responseStatus = responseJSON.data.snapshotClaimStatus.status;

    // Check that the address is not empty
    if (!address) {
      return { currentState: 'VOTE_TO_CLAIM' };
    }
    return { currentState: responseStatus };
  }
}
