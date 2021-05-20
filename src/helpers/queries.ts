import gql from 'graphql-tag';

export const VOTES_QUERY = gql`
  query Votes($id: String!) {
    votes(first: 10000, where: { proposal: $id }) {
      id
      voter
      created
      choice
    }
  }
`;

export const PROPOSAL_QUERY = gql`
  query Proposal($id: String!) {
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

export const SPACE_QUERY = gql`
  query Space($key: String!) {
    space(id: $key) {
      id
      name
      domain
      members
      network
      skin
      symbol
      admins
      terms
      plugins
      strategies {
        name
        params
      }
      filters {
        minScore
        onlyMembers
      }
    }
  }
`;
