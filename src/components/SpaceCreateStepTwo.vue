<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSpaceCreateForm } from '@/composables/useSpaceCreateForm';
import draggable from 'vuedraggable';

const props = defineProps({
  space: {
    type: Object,
    required: true
  }
});

const {
  form,
  choices,
  userSelectedDateStart,
  userSelectedDateEnd,
  updateDateStart,
  updateDateEnd
} = useSpaceCreateForm();

const modalDateSelectOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const selectedDate = ref('');

const disableChoiceEdit = computed(() => form.value.type === 'basic');

function selectDate(date) {
  selectedDate.value = date;
  modalDateSelectOpen.value = true;
}

function setDate(ts) {
  if (selectedDate.value) {
    form.value[selectedDate.value] = ts;
    if (selectedDate.value === 'start') {
      userSelectedDateStart.value = true;
      updateDateEnd(props.space);
    }
    if (selectedDate.value === 'end') {
      userSelectedDateEnd.value = true;
    }
  }
}

onMounted(() => {
  if (!userSelectedDateStart.value)
    form.value.start = parseInt((Date.now() / 1e3).toFixed());

  updateDateStart(props.space);
  updateDateEnd(props.space);
});
</script>

<template>
  <div>
    <Block :title="$t('create.voting')">
      <UiInput class="!mb-4" @click="modalVotingTypeOpen = true">
        <template v-slot:selected>
          <span class="w-full">
            {{ $t(`voting.${form.type}`) }}
          </span>
        </template>
        <template v-slot:label>
          {{ $t(`create.votingSystem`) }}
        </template>
      </UiInput>
      <div class="flex">
        <div class="overflow-hidden w-full space-y-2">
          <draggable
            v-model="choices"
            tag="transition-group"
            :component-data="{
              type: 'transition-group'
            }"
            v-bind="{ animation: 200 }"
            :disabled="disableChoiceEdit"
            item-key="id"
            handle=".drag-handle"
          >
            >
            <template #item="{ element, index }">
              <UiInput
                v-model="element.text"
                maxlength="32"
                :disabled="disableChoiceEdit"
                :placeholder="index > 0 ? $t('optional') : ''"
                class="group mb-0"
                :focusOnMount="index === 0"
              >
                <template v-slot:label>
                  <div
                    class="flex items-center cursor-grab active:cursor-grabbing drag-handle"
                    :class="{
                      'cursor-not-allowed active:cursor-not-allowed':
                        disableChoiceEdit
                    }"
                  >
                    <Icon name="draggable" size="16" class="mr-[12px]" />
                    {{ $tc('create.choice', [index + 1]) }}
                  </div>
                </template>
                <template v-slot:info>
                  <span
                    class="text-skin-text text-xs hidden group-focus-within:block"
                  >
                    {{ `${element.text.length}/32` }}
                  </span>
                </template>
              </UiInput>
            </template>
          </draggable>
        </div>
        <div v-if="!disableChoiceEdit" class="w-[48px] flex items-end ml-2">
          <UiSidebarButton
            v-if="!disableChoiceEdit"
            @click="choices.push({ id: choices.length, text: '' })"
            class="!w-[48px] !h-[48px]"
          >
            <Icon size="20" name="plus" class="text-skin-link" />
          </UiSidebarButton>
        </div>
      </div>
    </Block>

    <Block
      :title="$t('create.period')"
      icon="info"
      :iconTooltip="$t('create.votingPeriodExplainer')"
    >
      <div class="md:flex md:space-x-3">
        <UiInput
          @click="!space.voting?.delay ? selectDate('start') : null"
          :disabled="!!space.voting?.delay"
          v-tippy="{
            content: !!space.voting?.delay ? $t('create.delayEnforced') : null
          }"
          :class="{ 'cursor-not-allowed': space.voting?.delay }"
        >
          <template v-slot:selected>
            <span
              v-text="
                Math.round(form.start / 10) ===
                Math.round(parseInt((Date.now() / 1e3).toFixed()) / 10)
                  ? $t('create.now')
                  : $d(form.start * 1e3, 'short', 'en-US')
              "
            />
          </template>
          <template v-slot:label>
            {{ $t(`create.start`) }}
          </template>
          <template v-slot:info>
            <Icon
              name="calendar"
              size="18"
              class="flex items-center text-skin-text"
            />
          </template>
        </UiInput>

        <UiInput
          @click="!space.voting?.period ? selectDate('end') : null"
          :disabled="!!space.voting?.period"
          v-tippy="{
            content: space.voting?.period ? $t('create.periodEnforced') : null
          }"
          class="mb-0 md:mb-2"
          :class="{ 'cursor-not-allowed': space.voting?.period }"
        >
          <template v-slot:selected>
            <span v-text="$d(form.end * 1e3, 'short', 'en-US')" />
          </template>
          <template v-slot:label>
            {{ $t(`create.end`) }}
          </template>
          <template v-slot:info>
            <Icon
              name="calendar"
              size="18"
              class="flex items-center text-skin-text"
              :class="{ 'cursor-not-allowed': space.voting?.period }"
            />
          </template>
        </UiInput>
      </div>
    </Block>

    <Block v-if="$route.query.snapshot" :title="$t('snapshot')">
      <UiInput
        v-model="form.snapshot"
        :number="true"
        :placeholder="$t('create.snapshotBlock')"
      >
        <template v-slot:label>
          {{ $t('snapshot') }}
        </template>
      </UiInput>
    </Block>

    <teleport to="#modal">
      <ModalSelectDate
        :selectedDate="selectedDate"
        :open="modalDateSelectOpen"
        @close="modalDateSelectOpen = false"
        @input="setDate"
      />
      <ModalVotingType
        :open="modalVotingTypeOpen"
        @close="modalVotingTypeOpen = false"
        v-model:selected="form.type"
      />
    </teleport>
  </div>
</template>
