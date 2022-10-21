<script setup lang="ts">
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { Proposal, Vote } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  userVote: Vote | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoice = ref<number | null>(
  (props.userVote?.choice as number) || null
);

function selectChoice(i: number) {
  selectedChoice.value = i;
  emit('selectChoice', i);
}
</script>

<template>
  <div class="mb-3">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="relative mb-2 block w-full"
      :class="selectedChoice === i + 1 && '!border-skin-link'"
      @click="selectChoice(i + 1)"
    >
      <i-ho-check v-if="selectedChoice === i + 1" class="absolute" />
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
