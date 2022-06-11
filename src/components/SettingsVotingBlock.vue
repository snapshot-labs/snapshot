<script setup lang="ts">
import { ref, computed } from 'vue';
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';

const props = withDefaults(
  defineProps<{
    delay?: number;
    period?: number;
    quorum?: number;
    type?: string;
    hideAbstain?: boolean;
  }>(),
  {
    delay: 0,
    period: 0,
    quorum: 0,
    type: '',
    hideAbstain: false
  }
);

const emit = defineEmits([
  'update:delay',
  'update:period',
  'update:quorum',
  'update:type',
  'update:hideAbstain'
]);

const delayUnit = ref('h');
const periodUnit = ref('h');
const modalVotingTypeOpen = ref(false);

const votingDelay = computed({
  get: () => calcFromSeconds(props.delay, delayUnit.value),
  set: newVal =>
    emit(
      'update:delay',
      newVal ? calcToSeconds(newVal, delayUnit.value) : undefined
    )
});

const votingPeriod = computed({
  get: () => calcFromSeconds(props.period, periodUnit.value),
  set: newVal =>
    emit(
      'update:period',
      newVal ? calcToSeconds(newVal, periodUnit.value) : undefined
    )
});
</script>

<template>
  <BaseBlock :title="$t('settings.voting')">
    <div class="space-y-2">
      <div class="space-y-2 sm:flex sm:space-x-4 sm:space-y-0">
        <div class="w-full space-y-2">
          <BaseInput
            v-model="votingDelay"
            :title="$t('settings.votingDelay')"
            type="number"
            placeholder="e.g. 1"
          >
            <template #after>
              <select
                v-model="delayUnit"
                class="input ml-2 -mr-2 text-center !text-skin-text"
                required
              >
                <option value="h" selected>hours</option>
                <option value="d">days</option>
              </select>
            </template>
          </BaseInput>

          <BaseInput
            v-model="votingPeriod"
            :title="$t('settings.votingPeriod')"
            type="number"
            placeholder="e.g. 5"
          >
            <template #after>
              <select
                v-model="periodUnit"
                class="input ml-2 -mr-2 text-center !text-skin-text"
                required
              >
                <option value="h" selected>hours</option>
                <option value="d">days</option>
              </select>
            </template>
          </BaseInput>
        </div>

        <div class="w-full space-y-2">
          <InputNumber
            :model-value="quorum"
            :title="$t('settings.quorum')"
            placeholder="1000"
            @update:model-value="emit('update:quorum', $event)"
          />

          <InputSelect
            :title="$t(`settings.type`)"
            :model-value="type ? $t(`voting.${type}`) : $t('settings.anyType')"
            @select="modalVotingTypeOpen = true"
          />
        </div>
      </div>

      <BaseSwitch
        :model-value="hideAbstain"
        :text-right="$t('settings.hideAbstain')"
        @update:model-value="emit('update:hideAbstain', $event)"
      />
    </div>
    <teleport to="#modal">
      <ModalVotingType
        :selected="type"
        :open="modalVotingTypeOpen"
        allow-any
        @update:selected="emit('update:type', $event)"
        @close="modalVotingTypeOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
