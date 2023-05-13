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
  'clc.la',
  'zealy.io/c/cyberconnectofficial/questboard',
  'launchmynft.io/collections/0x954Fe3E2Cb92cadD5f5b9Bfdb79F477df8c1cFFB/zNIig3WZXtMkNcIrnkTu',
  'zealy.io/c/layerzerolabs',
  'drive.google.com/file/d/1-KVIXmLgWc8cbhu5U6QV0CmiE9BXOsDK/view?usp=sharing',
  'zealy.io/c/pepeofficial'
];

// Only add proposal ids if the proposal body has not unique urls
const FLAGGED_PROPOSAL_IDS = [
  '0x39720d6712fa3fcdf5919600d8c93e4743286dcdd6681042bd586d2be87d3916',
  '0x8ccf2ee2b328fdfee9ca06cca286fb71f76a8b86fc79ecb5d9b1aba830b1ced7',
  '0x3c52728f3eeebac44b2ef580ab9173c66cee2a4bb09c83374cd3298ada3b47e7',
  '0x29a572ca57e9648c5d4d0715d895724ae5782d10276bbfbc25afc973be62af74',
  '0x5d80f3b11111faaa38dcc3c79d82f66a2adf5a0f0f3885513a608c594b3ef424',
  '0x2e7fd810f0f398366a510c455d17fcda3e22ba9b6197c2e2e7d08a427a209514',
  '0xdd85b2ffc6757ecf55f63340651843d1ea872608217f105f12d4328159ac21ea',
  '0x07db27a2237085195e2327ba3bc0e70ece0007217073f67cd0d5686e9b35cd54',
  '0xae5784ab2288b54d52b35e1807f971c3d7569522c13607bba4b67c5a992a42c2',
  '0xd604ecce9fe18d2fa1a665a5860cdaf0e690825a564058b5229c5930e175228d',
  '0xeab369966042d8bc6f8d032d4f8966fe2c82a44eba0fd493f9b30df9cc2d782b',
  '0x2a85e697460b5458b4f991351d18ecec8ad9ebf2d3ead8f71d6c07658b670315',
  '0x702b447d7a41bcc99f6f1ba8fad39b2e43e080c92c033658273b3724d1478497',
  '0xa631f8ba6a8df7ffc120b779ef7d91b4c62830636947d80c4dafcb99a0012205',
  '0x6fee9f6c1530feb8e478058d35d8f03aae51e4f1b8b60378ee32869b59e918d6'
];

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
    if (FLAGGED_PROPOSAL_IDS.includes(proposal.id)) return true;
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