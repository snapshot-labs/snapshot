<script setup lang="ts">
import { ref, computed } from 'vue';
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';

const props = withDefaults(
  defineProps<{
    delay?: number;
    period?: number;
    quorum?: number;
    type?: string;
    privacy?: string;
    hideAbstain?: boolean;
  }>(),
  {
    delay: 0,
    period: 0,
    quorum: 0,
    type: '',
    privacy: '',
    hideAbstain: false
  }
);

const emit = defineEmits([
  'update:delay',
  'update:period',
  'update:quorum',
  'update:type',
  'update:privacy',
  'update:hideAbstain'
]);

const delayUnit = ref('h');
const periodUnit = ref('h');

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
                <option value="h" selected>{{ $t('settings.hours') }}</option>
                <option value="d">{{ $t('settings.days') }}</option>
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
                <option value="h" selected>
                  {{ $t('settings.hours') }}
                </option>
                <option value="d">{{ $t('settings.days') }}</option>
              </select>
            </template>
          </BaseInput>
        </div>

        <div class="w-full space-y-2">
          <InputNumber
            :model-value="quorum"
            :title="$t('settings.quorum.label')"
            :information="$t('settings.quorum.information')"
            placeholder="1000"
            @update:model-value="emit('update:quorum', $event)"
          />

          <InputSelectVotingtype
            :type="type"
            :information="$t(`settings.type.information`)"
            allow-any
            @update:type="emit('update:type', $event)"
          />

          <InputSelectPrivacy
            :privacy="privacy"
            :information="$t(`privacy.information`)"
            allow-any
            @update:privacy="emit('update:privacy', $event)"
          />
        </div>
      </div>

      <BaseSwitch
        :model-value="hideAbstain"
        :text-right="$t('settings.hideAbstain')"
        @update:model-value="emit('update:hideAbstain', $event)"
      />
    </div>
  </BaseBlock>
</template>
