<script setup lang="ts">
import { Proposal, Choice } from '@/helpers/interfaces';
import voting from '@snapshot-labs/snapshot.js/src/voting';

const props = defineProps<{
  proposal: Proposal;
  modelValue: Choice | null;
}>();

const emit = defineEmits(['update:modelValue', 'clickVote']);

const { web3, web3Account } = useWeb3();
const { userVote, loadUserVote, loadingUserVote } = useProposalVotes(
  props.proposal
);

const isEditing = ref(false);

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
    return userVote.value.choice as any;
  }
  return null;
});

function emitChoice(c) {
  emit('update:modelValue', c);
}

watch(web3Account, loadUserVote, { immediate: true });
</script>

<template>
  <BaseBlock
    class="mb-4"
    :title="
      isEditing
        ? 'Change your vote'
        : validatedUserChoice
          ? 'Your vote'
          : 'Cast your vote'
    "
  >
    <template #button>
      <button
        v-if="!isEditing && validatedUserChoice"
        type="button"
        class="flex items-center gap-1"
        @click="isEditing = true"
      >
        <i-ho-pencil class="text-sm" />
        Change vote
      </button>
    </template>
    <div class="pb-2">
      <LoadingList v-if="loadingUserVote" />
      <template v-else>
        <SpaceProposalVoteSingleChoice
          v-if="proposal.type === 'single-choice' || proposal.type === 'basic'"
          :proposal="proposal"
          :user-choice="validatedUserChoice"
          :is-editing="isEditing"
          @select-choice="emitChoice"
        />
        <SpaceProposalVoteApproval
          v-if="proposal.type === 'approval'"
          :proposal="proposal"
          :user-choice="validatedUserChoice"
          :is-editing="isEditing"
          @select-choice="emitChoice"
        />
        <SpaceProposalVoteQuadratic
          v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
          :proposal="proposal"
          :user-choice="validatedUserChoice"
          :is-editing="isEditing"
          @select-choice="emitChoice"
        />
        <SpaceProposalVoteRankedChoice
          v-if="proposal.type === 'ranked-choice'"
          :proposal="proposal"
          :user-choice="validatedUserChoice"
          :is-editing="isEditing"
          @select-choice="emitChoice"
        />
      </template>
    </div>
    <div
      v-if="!loadingUserVote && (!validatedUserChoice || isEditing)"
      class="pb-3 pt-2"
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

    <div class="pt-3">
      <SpaceProposalVoteBoost :proposal="proposal" />
    </div>
  </BaseBlock>
</template>
