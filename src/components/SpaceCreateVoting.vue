<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import draggable from 'vuedraggable';
import { useSpaceCreateForm } from '@/composables/useSpaceCreateForm';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

const props = defineProps<{
  space: ExtendedSpace;
  dateStart: number;
  dateEnd: number;
}>();

const emit = defineEmits(['userSelectedDate']);

const selectedDate = ref('');
const modalDateSelectOpen = ref(false);
const modalVotingTypeOpen = ref(false);

const { form, sourceProposalLoaded, userSelectedDateStart } =
  useSpaceCreateForm();

const disableChoiceEdit = computed(() => form.value.type === 'basic');

function addChoices(num) {
  for (let i = 1; i <= num; i++) {
    form.value.choices.push({ key: form.value.choices.length, text: '' });
  }
}

function selectDate(date) {
  selectedDate.value = date;
  modalDateSelectOpen.value = true;
}

function setDate(ts) {
  if (selectedDate.value) {
    form.value[selectedDate.value] = ts;
    if (selectedDate.value === 'start') {
      userSelectedDateStart.value = true;
    }
    if (selectedDate.value === 'end') {
      emit('userSelectedDate');
    }
  }
}

watch(
  () => form.value.type,
  (newType, oldType) => {
    if (newType !== 'basic' && oldType === 'basic') {
      form.value.choices = [
        { key: 0, text: '' },
        { key: 1, text: '' }
      ];
    }
    if (form.value.type === 'basic') {
      form.value.choices = [
        { key: 1, text: 'For' },
        { key: 2, text: 'Against' },
        { key: 3, text: 'Abstain' }
      ];
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // Initialize the start date to current
  if (!sourceProposalLoaded.value && !userSelectedDateStart.value)
    form.value.start = Number((Date.now() / 1e3).toFixed());
  // Initialize the proposal type if set in space
  if (props.space?.voting?.type) form.value.type = props.space.voting.type;
  // Initialize the snapshot block number
  if (props.space?.network) {
    form.value.snapshot =
      (await getBlockNumber(getProvider(props.space.network, 'brovider'))) - 4;
  }
});
</script>

<template>
  <div class="space-y-4">
    <BaseBlock :title="$t('create.voting')">
      <UiInput
        v-tippy="{
          content: !!space.voting?.type
            ? $t('create.typeEnforced', { type: $t(`voting.${form.type}`) })
            : null
        }"
        :disabled="!!space.voting?.type"
        :class="[space.voting?.type ? 'cursor-not-allowed' : 'cursor-pointer']"
        class="!mb-4"
        @click="!space.voting?.type ? (modalVotingTypeOpen = true) : null"
      >
        <template #selected>
          <span class="w-full">
            {{ $t(`voting.${form.type}`) }}
          </span>
        </template>
        <template #label>
          {{ $t(`create.votingSystem`) }}
        </template>
      </UiInput>
      <div class="flex">
        <div class="w-full overflow-hidden">
          <draggable
            v-model="form.choices"
            v-bind="{ animation: 200 }"
            :disabled="disableChoiceEdit"
            item-key="id"
            handle=".drag-handle"
            class="space-y-2"
          >
            >
            <template #item="{ element, index }">
              <UiInput
                v-model="element.text"
                maxlength="32"
                :disabled="disableChoiceEdit"
                :placeholder="index > 0 ? $t('optional') : ''"
                class="group"
                :focus-on-mount="index === 0"
              >
                <template #label>
                  <div
                    class="drag-handle flex cursor-grab items-center active:cursor-grabbing"
                    :class="{
                      'cursor-not-allowed active:cursor-not-allowed':
                        disableChoiceEdit
                    }"
                  >
                    <BaseIcon name="draggable" size="16" class="mr-[12px]" />
                    {{ $tc('create.choice', [index + 1]) }}
                  </div>
                </template>
                <template #info>
                  <span
                    class="hidden text-xs text-skin-text group-focus-within:block"
                  >
                    {{ `${element.text.length}/32` }}
                  </span>
                </template>
              </UiInput>
            </template>
          </draggable>
        </div>
        <div v-if="!disableChoiceEdit" class="ml-2 flex w-[48px] items-end">
          <ButtonSidebar
            v-if="!disableChoiceEdit"
            class="!h-[42px] !w-[42px]"
            @click="addChoices(1)"
          >
            <BaseIcon size="20" name="plus" class="text-skin-link" />
          </ButtonSidebar>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock
      :title="$t('create.period')"
      icon="info"
      :icon-tooltip="$t('create.votingPeriodExplainer')"
    >
      <div class="md:flex md:space-x-3">
        <UiInput
          v-tippy="{
            content: !!space.voting?.delay ? $t('create.delayEnforced') : null
          }"
          :disabled="!!space.voting?.delay"
          :class="[
            space.voting?.delay ? 'cursor-not-allowed' : 'cursor-pointer'
          ]"
          @click="!space.voting?.delay ? selectDate('start') : null"
        >
          <template #selected>
            <span
              v-text="
                Math.round(dateStart / 10) ===
                Math.round(parseInt((Date.now() / 1e3).toFixed()) / 10)
                  ? $t('create.now')
                  : $d(dateStart * 1e3, 'short', 'en-US')
              "
            />
          </template>
          <template #label>
            {{ $t(`create.start`) }}
          </template>
          <template #info>
            <BaseIcon
              name="calendar"
              size="18"
              class="flex items-center text-skin-text"
            />
          </template>
        </UiInput>

        <UiInput
          v-tippy="{
            content: space.voting?.period ? $t('create.periodEnforced') : null
          }"
          :disabled="!!space.voting?.period"
          class="mb-0 md:mb-2"
          :class="[
            space.voting?.period ? 'cursor-not-allowed' : 'cursor-pointer'
          ]"
          @click="!space.voting?.period ? selectDate('end') : null"
        >
          <template #selected>
            <span v-text="$d(dateEnd * 1e3, 'short', 'en-US')" />
          </template>
          <template #label>
            {{ $t(`create.end`) }}
          </template>
          <template #info>
            <BaseIcon
              name="calendar"
              size="18"
              class="flex items-center text-skin-text"
              :class="{ 'cursor-not-allowed': space.voting?.period }"
            />
          </template>
        </UiInput>
      </div>
    </BaseBlock>

    <BaseBlock v-if="$route.query.snapshot" :title="$t('snapshot')">
      <UiInput
        v-model="form.snapshot"
        :number="true"
        :placeholder="$t('create.snapshotBlock')"
      >
        <template #label>
          {{ $t('snapshot') }}
        </template>
      </UiInput>
    </BaseBlock>
    <teleport to="#modal">
      <ModalSelectDate
        :selected-date="selectedDate"
        :open="modalDateSelectOpen"
        @close="modalDateSelectOpen = false"
        @input="setDate"
      />
      <ModalVotingType
        v-model:selected="form.type"
        :open="modalVotingTypeOpen"
        @close="modalVotingTypeOpen = false"
      />
    </teleport>
  </div>
</template>
