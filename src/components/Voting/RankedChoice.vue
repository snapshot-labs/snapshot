<template>
  <div class="mb-3">
    <div :class="{ 'mb-5': selectedChoices.length > 0 }">
      <draggable
        v-model="selectedChoices"
        tag="transition-group"
        :component-data="{ name: 'list' }"
        item-key="id"
        @change="updateChoices"
      >
        <template #item="{ element, index }">
          <div class="d-flex mb-2">
            <UiButton class="width-full button--active position-relative">
              <span class="position-absolute left-4">
                ({{ getNumberWithOrdinal(index + 1) }})</span
              >
              <span>{{ proposal.choices[element - 1] }}</span>
              <span
                @click="removeChoice(index)"
                class="float-right position-absolute right-4"
              >
                <Icon name="close" size="12" />
              </span>
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
        {{ _shorten(choice, 32) }}

        <PluginAragonGovern :proposal="proposal" />
      </UiButton>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { getNumberWithOrdinal } from '@/helpers/utils';

export default {
  components: { draggable },
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  emits: ['selectChoice'],
  setup(_, { emit }) {
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

    return {
      selectChoice,
      selectedChoices,
      removeChoice,
      getNumberWithOrdinal,
      updateChoices
    };
  }
};
</script>
