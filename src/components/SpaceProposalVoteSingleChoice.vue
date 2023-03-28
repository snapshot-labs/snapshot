<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoice = ref<number | null>(null);

function selectChoice(i: number) {
  selectedChoice.value = i;
  emit('selectChoice', i);
}

watch(
  () => props.userChoice,
  () => {
    if (!selectedChoice.value)
      selectedChoice.value = clone(props.userChoice) || null;
    emit('selectChoice', selectedChoice.value);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mb-3">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="relative mb-2 block w-full"
      :class="selectedChoice === i + 1 && '!border-skin-link'"
      :data-testid="`sc-choice-button-${i}`"
      @click="selectChoice(i + 1)"
    >
      <i-ho-check v-if="selectedChoice === i + 1" class="absolute" />
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
