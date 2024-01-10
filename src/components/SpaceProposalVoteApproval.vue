<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number[] | null;
  isEditing: boolean;
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
  <div>
    <div v-if="userChoice?.length === 0 && !isEditing">
      <BaseMessage level="info">
        You voted without selecting a choice. Your vote will be counted as a
        <strong>blank vote</strong>.
      </BaseMessage>
    </div>
    <div data-testid="approval-choice-list">
      <template v-for="(choice, i) in proposal.choices" :key="i">
        <TuneButton
          v-if="isEditing ? true : userChoice?.includes(i + 1) || !userChoice"
          class="relative mb-2 last:mb-0 block w-full text-left"
          :class="{
            '!border-skin-link': selectedChoices.includes(i + 1),
            'border-skin-border hover:border-skin-link':
              !selectedChoices.includes(i + 1),
            '!cursor-default': !isEditing
          }"
          :data-testid="`approval-choice-button-${i}`"
          @click="isEditing && selectChoice(i + 1)"
        >
          <i-ho-check
            v-if="selectedChoices.includes(i + 1)"
            class="absolute right-[20px]"
          />
          {{ shorten(choice, 32) }}
        </TuneButton>
      </template>
    </div>
  </div>
</template>
