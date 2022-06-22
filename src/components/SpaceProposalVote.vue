<script setup>
import { computed } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  proposal: {
    type: Object,
    required: true
  },
  modelValue: [Array, Number, Object]
});

const emit = defineEmits(['update:modelValue', 'clickVote']);

const { web3 } = useWeb3();

const selectedChoices = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue.length;
  if (typeof props.modelValue === 'object' && props.modelValue !== null)
    return Object.keys(props.modelValue).length;
  return props.modelValue;
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
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteApproval
        v-if="proposal.type === 'approval'"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteQuadratic
        v-if="proposal.type === 'quadratic' || proposal.type === 'weighted'"
        :proposal="proposal"
        @selectChoice="emitChoice"
      />
      <SpaceProposalVoteRankedChoice
        v-if="proposal.type === 'ranked-choice'"
        :proposal="proposal"
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
      @click="$emit('clickVote')"
    >
      {{ $t('proposal.vote') }}
    </BaseButton>
  </BaseBlock>
</template>
