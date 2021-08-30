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
            <UiButton
              class="
                d-flex
                flex-justify-center
                width-full
                button--active
                position-relative
              "
            >
              <div class="position-absolute left-4">
                ({{ getNumberWithOrdinal(index + 1) }})
              </div>
              <div style="width: 60%">
                <span class="truncated w-full">
                  {{ proposal.choices[element - 1] }}
                </span>
              </div>
              <div
                @click="removeChoice(index)"
                class="float-right position-absolute right-2 px-3"
              >
                <Icon name="close" size="12" />
              </div>
            </UiButton>
          </div>
        </template>
      </draggable>
    </div>
    <div v-for="(choice, i) in proposal.choices" :key="i">
      <UiButton
        v-if="!selectedChoices.includes(i + 1)"
        @click="selectChoice(i + 1)"
        class="d-block width-full mb-2"
        :class="selectedChoices.includes(i + 1) && 'button--active'"
      >
        <span class="truncated">{{ choice }}</span>

        <PluginAragonGovern :proposal="proposal" />
      </UiButton>
    </div>
  </div>
</template>
