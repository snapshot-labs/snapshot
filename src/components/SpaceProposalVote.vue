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
  return props.modelValue ?? 0;
});

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

const votedAndShutter = computed(
  () => props.proposal.privacy === 'shutter' && userVote.value
);

function emitChoice(c) {
  emit('update:modelValue', c);
}

watch(
  web3Account,
  () => {
    isEditing.value = false;
    loadUserVote(web3Account.value);
  },
  { immediate: true }
);

watch(
  () => props.proposal,
  () => {
    isEditing.value = false;
    loadUserVote(web3Account.value);
  }
);
</script>

<template>
  <TuneBlock
    v-if="!loadingUserVote && (userVote || proposal.state === 'active')"
  >
    <template #header>
      <TuneBlockHeader
        :title="
          isEditing
            ? 'Change your vote'
            : userVote
              ? 'Your vote'
              : 'Cast your vote'
        "
      >
        <BaseButtonIcon
          v-if="!isEditing && userVote && proposal.state === 'active'"
          v-tippy="{
            content: 'Change your vote',
            delay: 100
          }"
          class="!p-0 !pr-1"
          @click="isEditing = true"
        >
          <i-ho-pencil class="text-sm" />
        </BaseButtonIcon>
      </TuneBlockHeader>
    </template>
    <div
      v-if="votedAndShutter && !isEditing && proposal.scores_state !== 'final'"
      class="border px-3 py-[12px] rounded-xl bg-[--border-color-subtle]"
    >
      <i-ho-lock-closed class="inline-block text-sm" />
      Your vote is encrypted with Shutter privacy until the proposal ends and
      the final score is calculated. You can still change your vote until then.
    </div>
    <BaseMessage
      v-else-if="userVote && !validatedUserChoice && !isEditing"
      level="info"
      class="border px-3 py-[12px] rounded-xl bg-[--border-color-subtle]"
    >
      Oops, we were unable to validate your vote. Please try voting again or
      consider opening a ticket with our support team on
      <BaseLink link="https://discord.snapshot.org">Discord</BaseLink>
    </BaseMessage>
    <div v-else>
      <SpaceProposalVoteSingleChoice
        v-if="proposal.type === 'single-choice' || proposal.type === 'basic'"
        :proposal="proposal"
        :user-choice="validatedUserChoice"
        :is-editing="isEditing || !userVote"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteApproval
        v-if="proposal.type === 'approval'"
        :proposal="proposal"
        :user-choice="validatedUserChoice"
        :is-editing="isEditing || !userVote"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :proposal="proposal"
        :user-choice="validatedUserChoice"
        :is-editing="isEditing || !userVote"
        @select-choice="emitChoice"
      />
      <SpaceProposalVoteRankedChoice
        v-if="proposal.type === 'ranked-choice'"
        :proposal="proposal"
        :user-choice="validatedUserChoice"
        :is-editing="isEditing || !userVote"
        @select-choice="emitChoice"
      />
    </div>
    <div
      v-if="!userVote || isEditing"
      v-tippy="{
        content: buttonTooltip
      }"
      class="pt-3"
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
  </TuneBlock>
</template>
