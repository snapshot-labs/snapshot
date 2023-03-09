<script setup lang="ts">
import { computed } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { Proposal, Choice, Vote } from '@/helpers/interfaces';
import voting from '@snapshot-labs/snapshot.js/src/voting';

const props = defineProps<{
  proposal: Proposal;
  modelValue: Choice;
  userVote: Vote | null;
}>();

const emit = defineEmits(['update:modelValue', 'clickVote']);

const { web3 } = useWeb3();

const selectedChoices = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length;
  if (typeof props.modelValue === 'object' && props.modelValue !== null)
    return Object.keys(props.modelValue).length;
  return props.modelValue;
});

const validatedUserChoice = computed(() => {
  if (!props.userVote?.choice) return null;
  if (
    voting[props.proposal.type].isValidChoice(
      props.userVote.choice,
      props.proposal.choices
    )
  ) {
    return props.userVote.choice;
  }
  return null;
});

function emitChoice(c) {
  emit('update:modelValue', c);
}
</script>

<template>
  <BaseBlock class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <SpaceProposalVoteSingleChoice
        v-if="proposal.type === 'single-choice' || proposal.type === 'basic'"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as number)"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteApproval
        v-if="proposal.type === 'approval'"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as number[])"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :proposal="proposal"
        :user-choice="(validatedUserChoice as Record<string, number>)"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteRankedChoice
        v-if="proposal.type === 'ranked-choice'"
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
