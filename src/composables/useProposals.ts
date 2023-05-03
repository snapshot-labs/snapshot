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
  'arbitrum-foundation.at',
  'shortest.link/oFpq',
  'shortest.link/nlt0',
  'zora.co/collect/0xac4a38e31e811a4c771c37240df356de61fc425f',
  'shortest.link/nR-S',
  'bit.ly/Layer0NFT',
  'shortest.link/nTdi',
  'shortest.link/nTfi',
  'bit.ly/PolygonzkEVMPioneer',
  'shortest.link/nZnh',
  'shortest.link/nZn1',
  'shortest.link/o4ZO',
  'shortest.link/pdKt',
  'bit.ly/zkEVMPioneer',
  'webclaims.cloud',
  'bit.ly/zkSyncMintNFT',
  'bit.ly/collectionsradiantairdrop',
  'bit.ly/stonetopaznft',
  'zealy.io/c/layerzer0/questboard',
  'zealy.io/c/zksynk/questboard',
  'launchmynft.io/collections/9AbvZvqiUs5hqjYJbFFm2z7KoskCB1G22tWwzmap5Qw/Vdrnuzd0piIQz7BQLwcf',
  'clc.to',
  'clc.am',
  'zealy.io/c/polygonzkevm/questboard',
  'app.questn.com/quest/764088010009522347',
  'app.questn.com/quest/762646918666248236',
  'clc.la/ZkSyncNFT',
  'zealy.io/c/cyberconnectofficial/questboard',
  'launchmynft.io/collections/0x954Fe3E2Cb92cadD5f5b9Bfdb79F477df8c1cFFB/zNIig3WZXtMkNcIrnkTu',
  'zealy.io/c/layerzerolabs'
];

// Only add proposal ids if the proposal body has not unique urls
const FLAGGED_PROPOSAL_IDS = {
  '0x39720d6712fa3fcdf5919600d8c93e4743286dcdd6681042bd586d2be87d3916': 1
};

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
    if (!proposals?.length) return [];
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
