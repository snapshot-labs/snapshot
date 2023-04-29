<script setup lang="ts">
const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.voting')">
    <div class="space-y-2">
      <div class="space-y-2">
        <TuneInputDuration
          v-model="form.voting.delay"
          :label="$t('settings.votingDelay')"
          :disabled="isViewOnly"
          hide-minutes
          block
        />

        <TuneInputDuration
          v-model="form.voting.period"
          :label="$t('settings.votingPeriod')"
          :disabled="isViewOnly"
          hide-minutes
          block
        />

        <TuneInput
          :model-value="form.voting.quorum"
          :label="$t('settings.quorum.label')"
          :hint="$t('settings.quorum.information')"
          :disabled="isViewOnly"
          placeholder="1000"
          type="number"
          @update:model-value="value => (form.voting.quorum = Number(value))"
        />

        <InputSelectVoteType
          :type="form.voting.type"
          :hint="$t(`settings.type.information`)"
          :is-disabled-settings="isViewOnly"
          allow-any
          @update:type="value => (form.voting.type = value)"
        />

        <InputSelectPrivacy
          :privacy="form.voting.privacy"
          :hint="$t(`privacy.information`)"
          :is-disabled="isViewOnly"
          allow-any
          @update:privacy="value => (form.voting.privacy = value)"
        />

        <InputSelectVoteValidation
          :validation="form.voteValidation"
          :voting-strategies="form.strategies"
          :disabled="isViewOnly"
          @add="value => (form.voteValidation = value)"
        />
      </div>

      <TuneSwitch
        v-model="form.voting.hideAbstain"
        :label="$t('settings.hideAbstain')"
        :disabled="isViewOnly"
      />
    </div>
  </BaseBlock>
</template>
