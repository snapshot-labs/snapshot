<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
  space?: ExtendedSpace;
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
          v-model="form.voting.quorum"
          :label="$t('settings.quorum.label')"
          :hint="$t('settings.quorum.information')"
          :disabled="isViewOnly"
          placeholder="1000"
          type="number"
        />

        <InputSelectVoteType
          :type="form.voting.type"
          :information="$t(`settings.type.information`)"
          :is-disabled-settings="isViewOnly"
          allow-any
          @update:type="value => (form.voting.type = value)"
        />

        <InputSelectPrivacy
          :privacy="form.voting.privacy"
          :information="$t(`privacy.information`)"
          :is-disabled="isViewOnly"
          allow-any
          @update:privacy="value => (form.voting.privacy = value)"
        />

        <InputSelectVoteValidation
          :validation="form.voteValidation"
          :is-disabled="isViewOnly"
          :space="space"
          @add="value => (form.voteValidation = value)"
        />
      </div>

      <TuneInputSwitch
        v-model="form.voting.hideAbstain"
        :hint="$t('settings.hideAbstain')"
        :disabled="isViewOnly"
      />
    </div>
  </BaseBlock>
</template>
