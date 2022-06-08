<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { getNumberWithOrdinal } from '@/helpers/utils';

defineProps({
  proposal: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref([]);

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
</script>

<template>
  <div class="mb-3">
    <div :class="{ 'mb-5': selectedChoices.length > 0 }">
      <draggable
        v-model="selectedChoices"
        :component-data="{ name: 'list' }"
        item-key="id"
        @change="updateChoices"
      >
        <template #item="{ element, index }">
          <div class="mb-2">
            <BaseButton
              class="flex w-full items-center justify-between !border-skin-link !px-3"
            >
              <div class="min-w-[60px] text-left">
                ({{ getNumberWithOrdinal(index + 1) }})
              </div>
              <div class="mx-2 w-full truncate text-center">
                {{ proposal.choices[element - 1] }}
              </div>
              <div
                @click="removeChoice(index)"
                class="ml-[40px] min-w-[20px] text-right"
              >
                <BaseIcon name="close" size="12" />
              </div>
            </BaseButton>
          </div>
        </template>
      </draggable>
    </div>
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <BaseButton
        v-if="!selectedChoices.includes(i + 1)"
        @click="selectChoice(i + 1)"
        class="mb-2 block w-full"
        :class="selectedChoices.includes(i + 1) && 'border-skin-link'"
      >
        <span class="truncate">{{ choice }}</span>
      </BaseButton>
    </div>
  </div>
</template>
