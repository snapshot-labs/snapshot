import gql from 'graphql-tag';

export const VOTES_QUERY = gql`
  query Votes(
    $id: String!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: OrderDirection
    $voter: String
  ) {
    votes(
      first: $first
      skip: $skip
      where: { proposal: $id, vp_gt: 0, voter: $voter }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ipfs
      voter
      choice
      vp
      vp_by_strategy
    }
  }
`;

export const PROPOSAL_QUERY = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      ipfs
      title
      body
      discussion
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      type
      strategies {
        name
        network
        params
      }
      space {
        id
        name
      }
      scores_state
      scores
      scores_by_strategy
      scores_total
      votes
    }
  }
`;

export const PROPOSALS_QUERY = gql`
  query Proposals(
    $first: Int!
    $skip: Int!
    $state: String!
    $space: String
    $space_in: [String]
    $author_in: [String]
  ) {
    proposals(
      first: $first
      skip: $skip
      where: {
        space: $space
        state: $state
        space_in: $space_in
        author_in: $author_in
      }
    ) {
      id
      ipfs
      title
      body
      start
      end
      state
      author
      created
      choices
      space {
        id
        name
        members
        avatar
        symbol
      }
      scores_state
      scores_total
      scores
      votes
    }
  }
`;

export const NOTIFICATION_PROPOSALS_QUERY = gql`
  query Proposals(
    $first: Int!
    $state: String!
    $space_in: [String]
    $start_gte: Int
  ) {
    proposals(
      first: $first
      where: { state: $state, space_in: $space_in, start_gte: $start_gte }
    ) {
      id
      title
      start
      end
      state
      space {
        id
        name
        avatar
      }
    }
  }
`;

export const FOLLOWS_QUERY = gql`
  query Follows($space_in: [String], $follower_in: [String]) {
    follows(where: { space_in: $space_in, follower_in: $follower_in }) {
      id
      follower
      space {
        id
      }
    }
  }
`;

export const SUBSCRIPTIONS_QUERY = gql`
  query Subscriptions($space: String, $address: String) {
    subscriptions(where: { space: $space, address: $address }) {
      id
      address
      space {
        id
      }
    }
  }
`;

export const ALIASES_QUERY = gql`
  query Aliases($address: String!, $alias: String!) {
    aliases(where: { address: $address, alias: $alias }) {
      address
      alias
    }
  }
`;

export const SPACES_QUERY = gql`
  query Spaces($id_in: [String]) {
    spaces(where: { id_in: $id_in }) {
      id
      name
      about
      network
      symbol
      network
      terms
      skin
      avatar
      twitter
      website
      github
      private
      domain
      members
      admins
      categories
      plugins
      followersCount
      voting {
        delay
        period
        type
        quorum
        hideAbstain
      }
      strategies {
        name
        network
        params
      }
      validation {
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

export const ENS_DOMAINS_BY_ACCOUNT_QUERY = gql`
  query Domain($id: String!) {
    account(id: $id) {
      domains {
        name
      }
    }
  }
`;

export const ENS_DOMAIN_BY_HASH_QUERY = gql`
  query Registration($id: String!) {
    registration(id: $id) {
      domain {
        name
        labelName
      }
    }
  }
`;

export const SPACE_SKIN_QUERY = gql`
  query Space($id: String!) {
    space(id: $id) {
      skin
    }
  }
`;

export const SPACE_DELEGATE_QUERY = gql`
  query Space($id: String!) {
    space(id: $id) {
      id
      symbol
      network
      strategies {
        name
        network
        params
      }
    }
  }
`;

export const SKINS_COUNT_QUERY = gql`
  query Skins {
    skins {
      id
      spacesCount
    }
  }
`;

export const NETWORKS_COUNT_QUERY = gql`
  query Networks {
    networks {
      id
      spacesCount
    }
  }
`;

export const PLUGINS_COUNT_QUERY = gql`
  query Plugins {
    plugins {
      id
      spacesCount
    }
  }
`;

export const VALIDATIONS_COUNT_QUERY = gql`
  query Validations {
    validations {
      id
      spacesCount
    }
  }
`;

export const STRATEGIES_QUERY = gql`
  query Strategies {
    strategies {
      id
      author
      version
      spacesCount
    }
  }
`;

export const EXTENDED_STRATEGY_QUERY = gql`
  query Strategy($id: String!) {
    strategy(id: $id) {
      id
      author
      version
      spacesCount
      about
      schema
      examples
    }
  }
`;
