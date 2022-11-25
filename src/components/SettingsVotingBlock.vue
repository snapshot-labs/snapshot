<script setup lang="ts">
import { ref, computed } from 'vue';
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form } = useSpaceForm(props.context);

const delayUnit = ref('h');
const periodUnit = ref('h');

const votingDelay = computed({
  get: () =>
    calcFromSeconds(form.value.voting.delay, delayUnit.value) || undefined,
  set: newVal =>
    (form.value.voting.delay = newVal
      ? calcToSeconds(newVal, delayUnit.value)
      : undefined)
});

const votingPeriod = computed({
  get: () =>
    calcFromSeconds(form.value.voting.period, periodUnit.value) || undefined,
  set: newVal =>
    (form.value.voting.period = newVal
      ? calcToSeconds(newVal, periodUnit.value)
      : undefined)
});
</script>

<template>
  <BaseBlock :title="$t('settings.voting')">
    <div class="space-y-2">
      <div class="space-y-2">
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

        <InputNumber
          v-model="form.voting.quorum"
          :title="$t('settings.quorum.label')"
          :information="$t('settings.quorum.information')"
          placeholder="1000"
        />

        <InputSelectVoteType
          :type="form.voting.type"
          :information="$t(`settings.type.information`)"
          allow-any
          @update:type="value => (form.voting.type = value)"
        />

        <InputSelectPrivacy
          :privacy="form.voting.privacy"
          :information="$t(`privacy.information`)"
          allow-any
          @update:privacy="value => (form.voting.privacy = value)"
        />

        <InputSelectVoteValidation
          :validation="form.voteValidation"
          @add="value => (form.voteValidation = value)"
        />
      </div>

      <InputSwitch
        v-model="form.voting.hideAbstain"
        :text-right="$t('settings.hideAbstain')"
      />
    </div>
  </BaseBlock>
</template>
