import { computed, ref, watch } from 'vue';
import { useProfiles } from '@/composables/useProfiles';
import { useWeb3 } from '@/composables/useWeb3';
import { useI18n } from '@/composables/useI18n';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { ACTIVITY_VOTES_QUERY } from '@/helpers/queries';
import { useFollowSpace } from '@/composables/useFollowSpace';

const { t } = useI18n();

const { apolloQuery } = useApolloQuery();
const { profiles } = useProfiles();
const { web3Account } = useWeb3();
const { followingSpaces } = useFollowSpace();

const profile = computed(() => profiles.value[web3Account.value]);

const hasSetPublicProfile = computed(() =>
  profile.value?.name ? true : false
);
const hasFollowedSpace = computed(() => followingSpaces.value.length);
const hasVoted = ref(false);
const hasCreatedProposal = ref(false);

const onboardingChecklist = ref([
  {
    checked: hasSetPublicProfile,
    name: t('onboarding.profile')
  },
  {
    checked: hasFollowedSpace,
    name: t('onboarding.space')
  },
  {
    checked: hasVoted,
    name: t('onboarding.vote')
  },
  {
    checked: hasCreatedProposal,
    name: t('onboarding.proposal')
  }
]);

async function loadVotes() {
  const votes = await apolloQuery(
    {
      query: ACTIVITY_VOTES_QUERY,
      variables: {
        voter: profile.value.id
      }
    },
    'votes'
  );

  hasVoted.value = votes.length ? true : false;
}

async function loadProposals() {
  const proposals = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: 1,
        skip: 0,
        state: 'all',
        author_in: [profile.value.id]
      }
    },
    'proposals'
  );

  hasCreatedProposal.value = proposals.length ? true : false;
}

watch(profiles, p => {
  if (profile.value) {
    loadVotes();
    loadProposals();
  }
});

export function useOnboardingChecklist() {
  return { onboardingChecklist };
}
