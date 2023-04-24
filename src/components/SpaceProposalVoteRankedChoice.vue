<script setup lang="ts">
import draggable from 'vuedraggable';
import { getNumberWithOrdinal } from '@/helpers/utils';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number[] | null;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref<number[]>([]);

function selectChoice(i) {
  selectedChoices.value.push(i);
  emit('selectChoice', selectedChoices.value);
}

function removeChoice(i) {
  selectedChoices.value.splice(i, 1);
}

function updateChoices() {
  emit('selectChoice', selectedChoices.value);
}

watch(
  () => props.userChoice,
  () => {
    if (selectedChoices.value.length === 0)
      selectedChoices.value = clone(props.userChoice) || [];
    emit('selectChoice', selectedChoices.value);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mb-3">
    <div :class="{ 'mb-5': selectedChoices.length > 0 }">
      <draggable
        v-model="selectedChoices"
        :component-data="{ name: 'list' }"
        item-key="id"
        data-testid="ranked-choice-selected-list"
        @change="updateChoices"
      >
        <template #item="{ element, index }">
          <BaseButton
            class="!mb-2 flex w-full items-center justify-between !border-skin-link !px-3"
          >
            <div class="min-w-[60px] text-left">
              ({{ getNumberWithOrdinal(index + 1) }})
            </div>
            <div class="mx-2 w-full truncate text-center">
              {{ proposal.choices[element - 1] }}
            </div>
            <div
              class="ml-[40px] min-w-[20px] text-right"
              :data-testid="`ranked-choice-selected-delete-${index}`"
              @click="removeChoice(index)"
            >
              <BaseIcon name="close" size="12" />
            </div>
          </BaseButton>
        </template>
      </draggable>
    </div>
    <div
      v-for="(choice, i) in proposal.choices"
      :key="i"
      data-testid="ranked-choice-select-list"
    >
      <BaseButton
        v-if="!selectedChoices.includes(i + 1)"
        class="mb-2 block w-full"
        :class="selectedChoices.includes(i + 1) && 'border-skin-link'"
        @click="selectChoice(i + 1)"
      >
        <span class="truncate">{{ choice }}</span>
      </BaseButton>
    </div>
  </div>
</template>
