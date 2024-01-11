<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number | null;
  isEditing: boolean;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoice = ref<number | null>(null);

function selectChoice(i: number) {
  if (props.userChoice && !props.isEditing) return;
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
  <div>
    <template v-for="(choice, i) in proposal.choices" :key="i">
      <TuneButton
        v-if="isEditing ? true : userChoice === i + 1 || !userChoice"
        class="relative mb-2 last:mb-0 block w-full text-left"
        :class="[
          selectedChoice === i + 1 && '!border-skin-link',
          {
            '!cursor-default': !isEditing
          }
        ]"
        :data-testid="`sc-choice-button-${i}`"
        @click="selectChoice(i + 1)"
      >
        <i-ho-check
          v-if="selectedChoice === i + 1"
          class="absolute right-[20px]"
        />
        {{ shorten(choice, 32) }}
      </TuneButton>
    </template>
  </div>
</template>
