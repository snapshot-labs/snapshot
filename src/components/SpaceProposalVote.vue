<script setup lang="ts">
import { Proposal, Choice } from '@/helpers/interfaces';
import voting from '@snapshot-labs/snapshot.js/src/voting';

const props = defineProps<{
  proposal: Proposal;
  modelValue: Choice | null;
}>();

const emit = defineEmits(['update:modelValue', 'clickVote']);

const { web3, web3Account } = useWeb3();
const { userVote, loadUserVote } = useProposalVotes(props.proposal);

const key = ref(0);

const selectedChoices = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length;
  if (typeof props.modelValue === 'object' && props.modelValue !== null)
    return Object.keys(props.modelValue).length;
  return props.modelValue;
}) as ComputedRef<number>;

const validatedUserChoice = computed(() => {
  if (!userVote.value?.choice) return null;
  if (
    voting[props.proposal.type].isValidChoice(
      userVote.value.choice,
      props.proposal.choices
    )
  ) {
    return userVote.value.choice;
  }
  return null;
});

const buttonTooltip = computed(() => {
  if (
    props.proposal.type === 'ranked-choice' &&
    selectedChoices.value < props.proposal.choices.length
  )
    return 'Please rank all choices';

  if (
    props.proposal.type !== 'approval' &&
    props.proposal.type !== 'ranked-choice' &&
    selectedChoices.value < 1
  )
    return 'Please select at least one choice';

  return '';
});

function emitChoice(c) {
  emit('update:modelValue', c);
}

watch(web3Account, loadUserVote, { immediate: true });

watch(validatedUserChoice, () => {
  key.value++;
});
</script>

<template>
  <BaseBlock class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <SpaceProposalVoteSingleChoice
        v-if="proposal.type === 'single-choice' || proposal.type === 'basic'"
        :key="key"
        :proposal="proposal"
        :user-choice="validatedUserChoice as number"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteApproval
        v-if="proposal.type === 'approval'"
        :key="key"
        :proposal="proposal"
        :user-choice="validatedUserChoice as number[]"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :key="key"
        :proposal="proposal"
        :user-choice="validatedUserChoice as Record<string, number>"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteRankedChoice
        v-if="proposal.type === 'ranked-choice'"
        :key="key"
        :proposal="proposal"
        :user-choice="validatedUserChoice as number[]"
        @select-choice="emitChoice"
      />
    </div>
    <div
      v-tippy="{
        content: buttonTooltip
      }"
    >
      <TuneButton
        :disabled="
          web3.authLoading ||
          (selectedChoices < 1 && proposal.type !== 'approval') ||
          (selectedChoices < proposal.choices.length &&
            proposal.type === 'ranked-choice')
        "
        class="block w-full"
        primary
        data-testid="proposal-vote-button"
        @click="$emit('clickVote')"
      >
        {{ $t('proposal.vote') }}
      </TuneButton>
    </div>
  </BaseBlock>
</template>
