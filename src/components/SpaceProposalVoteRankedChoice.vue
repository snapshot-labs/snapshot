<script setup lang="ts">
import draggable from 'vuedraggable';
import { Proposal } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  userChoice: number[] | null;
  isEditing: boolean;
}>();

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref<number[]>([]);

function selectChoice(i) {
  selectedChoices.value.push(i);
  emit('selectChoice', selectedChoices.value);
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
  <div class="space-y-3">
    <div v-if="selectedChoices.length">
      <draggable
        v-model="selectedChoices"
        :component-data="{ name: 'list', type: 'transition-group' }"
        item-key="id"
        data-testid="ranked-choice-selected-list"
        v-bind="{ animation: 200 }"
        :disabled="userChoice?.length && !isEditing"
        @change="updateChoices"
      >
        <template #item="{ element, index }">
          <TuneButton
            class="!mb-2 last:!mb-0 flex w-full items-center justify-between !border-skin-link !px-3"
            :class="[!isEditing ? '!cursor-default' : 'cursor-grabbing']"
          >
            <div class="pl-1 flex truncate">
              <div>#{{ index + 1 }}</div>

              <div class="truncate pl-1">
                {{ proposal.choices[element - 1] }}
              </div>
            </div>
            <div class="pl-6">
              <i-ho-menu-alt-4 v-if="isEditing" class="text-sm" />
            </div>
          </TuneButton>
        </template>
      </draggable>
    </div>

    <div
      v-if="selectedChoices.length !== proposal.choices.length"
      class="space-y-2"
    >
      <div
        v-for="(choice, i) in proposal.choices"
        :key="i"
        data-testid="ranked-choice-select-list"
      >
        <TuneButton
          v-if="!selectedChoices.includes(i + 1)"
          class="block w-full"
          :class="selectedChoices.includes(i + 1) && 'border-skin-link'"
          @click="selectChoice(i + 1)"
        >
          <span class="truncate">{{ choice }}</span>
        </TuneButton>
      </div>
    </div>
  </div>
</template>
