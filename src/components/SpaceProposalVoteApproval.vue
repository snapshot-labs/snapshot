<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number[] | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref<number[]>([]);

function selectChoice(i: number) {
  if (selectedChoices.value.includes(i))
    selectedChoices.value.splice(selectedChoices.value.indexOf(i), 1);
  else selectedChoices.value.push(i);

  emit('selectChoice', selectedChoices.value);
}

watch(
  () => props.userChoice,
  () => {
    if (selectedChoices.value.length === 0)
      selectedChoices.value = clone(props.userChoice) || [];
    emit('selectChoice', selectedChoices.value || []);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mb-3" data-testid="approval-choice-list">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="relative mb-2 block w-full"
      :class="{
        '!border-skin-link': selectedChoices.includes(i + 1),
        'border-skin-border hover:border-skin-link': !selectedChoices.includes(
          i + 1
        )
      }"
      :data-testid="`approval-choice-button-${i}`"
      @click="selectChoice(i + 1)"
    >
      <i-ho-check v-if="selectedChoices.includes(i + 1)" class="absolute" />
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
