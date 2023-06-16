<script setup lang="ts">
import { Proposal, Choice } from '@/helpers/interfaces';
import voting from '@snapshot-labs/snapshot.js/src/voting';

const props = defineProps<{
  proposal: Proposal;
  modelValue: Choice;
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
});

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
        :user-choice="(validatedUserChoice as number)"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteApproval
        v-if="proposal.type === 'approval'"
        :key="key"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as number[])"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :key="key"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as Record<string, number>)"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteRankedChoice
        v-if="proposal.type === 'ranked-choice'"
        :key="key"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as number[])"
        @selectChoice="emitChoice"
      />
    </div>
    <BaseButton
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
    </BaseButton>
  </BaseBlock>
</template>
