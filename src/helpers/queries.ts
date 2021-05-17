import gql from 'graphql-tag';

export const PROPOSAL_AND_VOTES_QUERY = gql`
  query Spaces($id: String!) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      strategies {
        name
        params
      }
      space {
        id
        name
      }
    }
    votes(first: 10000, where: { proposal: $id }) {
      id
      voter
      created
      choice
    }
  }
`;

export const PROPOSAL_QUERY = gql`
  query Spaces($id: String!) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      strategies {
        name
        params
      }
      space {
        id
        name
      }
    }
  }
`;
