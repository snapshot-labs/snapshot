import { Proposal } from '@/helpers/interfaces';
import { USER_VOTED_PROPOSAL_IDS_QUERY } from '@/helpers/queries';

// If possible, flag urls from the proposal body
const FLAGGED_LINKS = [
  'launchmynft.io/collections/0x7aa7f06AC1130EdCda57f57510E2F89059182456/3pRG5zvgrofq5uwpxrY1',
  'launchmynft.io/collections/0x1800144e1f916BC1fB6c0EFB1B7abcc7aF04ca48/DXiHOOeTTqPh29Nh3PCI',
  'launchmynft.io/collections/0x47dE377d25eBcF2FE33E42E974381a6D3b8688DE/D0dPJ4Gt10aymLZVQ6nS',
  'launchmynft.io/collections/0x000000798e0CA40142275dc9C991766cf1571793/u1jk1jHCcdJwr5Lz9ZQ3',
  'zora.co/collect/0xe8cff2b2dd9916727684e38132632ccf803ab523',
  'bit.ly/SuiAirdropEligibleContributors',
  'shortest.link/nlnL',
  'bit.ly/3obAcG6',
  'bit.ly/3GKKLpP',
  'shortest.link/oiWG',
  'clm.arbitrum-foundation.at',
  'shortest.link/oFpq',
  'shortest.link/nlt0',
  'zora.co/collect/0xac4a38e31e811a4c771c37240df356de61fc425f',
  'shortest.link/nR-S',
  'bit.ly/Layer0NFT',
  'shortest.link/nTdi',
  'shortest.link/nTfi',
  'bit.ly/PolygonzkEVMPioneer'
];

// Only add proposal ids if the proposal body has not unique urls
const FLAGGED_PROPOSAL_IDS = {};

interface ProposalsStore {
  space: {
    proposals: Proposal[];
  };
  timeline: {
    proposals: Proposal[];
  };
}

const store = reactive<ProposalsStore>({
  space: {
    proposals: []
  },
  timeline: {
    proposals: []
  }
});

const userVotedProposalIds = ref<string[]>([]);

export function useProposals() {
  function setTimelineProposals(proposals) {
    proposals = mapFlaggedProposals(proposals);
    store.timeline.proposals = proposals;
  }

  function addTimelineProposals(proposals) {
    proposals = mapFlaggedProposals(proposals);
    store.timeline.proposals = store.timeline.proposals.concat(proposals);
  }

  function setSpaceProposals(proposals) {
    proposals = mapFlaggedProposals(proposals);
    store.space.proposals = proposals;
  }

  function addSpaceProposals(proposals) {
    proposals = mapFlaggedProposals(proposals);
    store.space.proposals = store.space.proposals.concat(proposals);
  }

  function resetSpaceProposals() {
    store.space.proposals = [];
  }

  function removeSpaceProposal(id: string) {
    store.space.proposals = store.space.proposals.filter(
      proposal => proposal.id !== id
    );
  }

  function addVotedProposalId(id: string) {
    userVotedProposalIds.value.push(id);
  }

  function isFlaggedProposal(proposal: Proposal) {
    if (FLAGGED_PROPOSAL_IDS?.[proposal.id]) return true;
    if (FLAGGED_LINKS.some(link => proposal.body.includes(link))) return true;
    return false;
  }

  function mapFlaggedProposals(proposals: Proposal[]) {
    return proposals.map(proposal => {
      return {
        ...proposal,
        flagged: isFlaggedProposal(proposal)
      };
    });
  }

  const { apolloQuery } = useApolloQuery();
  async function getUserVotedProposalIds(voter: string, proposals: string[]) {
    if (!voter || !proposals) return;
    const votes = await apolloQuery(
      {
        query: USER_VOTED_PROPOSAL_IDS_QUERY,
        variables: {
          voter,
          proposals
        }
      },
      'votes'
    );

    const proposalId = votes?.map(vote => vote.proposal.id) ?? [];
    userVotedProposalIds.value = [
      ...new Set(userVotedProposalIds.value.concat(proposalId))
    ];
  }

  const proposalIds = computed(() => {
    const timelineProposals =
      store.timeline.proposals?.map(proposal => proposal.id) ?? [];
    const spaceProposals =
      store.space.proposals?.map(proposal => proposal.id) ?? [];
    return [...timelineProposals, ...spaceProposals];
  });

  const { web3Account } = useWeb3();
  watch(
    () => [store.space.proposals, store.timeline.proposals],
    () => {
      getUserVotedProposalIds(web3Account.value, proposalIds.value);
    }
  );

  watch(web3Account, () => {
    userVotedProposalIds.value = [];
    getUserVotedProposalIds(web3Account.value, proposalIds.value);
  });

  return {
    store,
    userVotedProposalIds,
    addVotedProposalId,
    setSpaceProposals,
    addSpaceProposals,
    resetSpaceProposals,
    removeSpaceProposal,
    setTimelineProposals,
    addTimelineProposals,
    isFlaggedProposal
  };
}
