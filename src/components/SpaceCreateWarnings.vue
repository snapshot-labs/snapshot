<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

import { useWeb3, useIntl, useGnosis } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  executingValidationFailed: boolean;
  passValidation: (string | boolean)[];
}>();

const { formatCompactNumber } = useIntl();
const { web3, web3Account } = useWeb3();
const { isGnosisAndNotSpaceNetwork } = useGnosis(props.space);
</script>

<template>
  <div class="mb-4 space-y-2">
    <MessageWarningGnosisNetwork
      v-if="isGnosisAndNotSpaceNetwork"
      :space="space"
      action="create"
      is-responsive
    />
    <!-- Shows when no wallet is connected and the space has any sort
      of validation set -->
    <BaseMessageBlock
      v-else-if="
        !web3Account &&
        !web3.authLoading &&
        (space?.validation?.params.minScore ||
          space?.filters.minScore ||
          space?.filters.onlyMembers)
      "
      level="warning"
      is-responsive
    >
      <span v-if="space?.filters.onlyMembers">
        {{ $t('create.validationWarning.basic.member') }}
      </span>
      <span
        v-else-if="
          space?.validation?.params.minScore || space?.filters.minScore
        "
      >
        {{
          $tc('create.validationWarning.basic.minScore', [
            formatCompactNumber(space.filters.minScore),
            space.symbol
          ])
        }}
      </span>
      <div>
        <BaseLink :link="{ name: 'spaceAbout', params: { key: space.id } }">{{
          $t('learnMore')
        }}</BaseLink>
      </div>
    </BaseMessageBlock>

    <!-- Shows when wallet is connected and executing validation fails (e.g.
      due to misconfigured strategy)  -->
    <BaseMessageBlock
      v-else-if="executingValidationFailed"
      level="warning"
      :route-object="{ name: 'spaceAbout', params: { key: space.id } }"
      is-responsive
    >
      {{ $t('create.validationWarning.executionError') }}
    </BaseMessageBlock>

    <!-- Shows when wallet is connected and doesn't pass validaion -->
    <BaseMessageBlock
      v-else-if="passValidation[0] === false"
      level="warning"
      is-responsive
    >
      <span v-if="passValidation[1] === 'basic'">
        <span v-if="space?.filters.onlyMembers">
          {{ $t('create.validationWarning.basic.member') }}
        </span>
        <span
          v-else-if="
            space?.validation?.params.minScore || space?.filters.minScore
          "
        >
          {{
            $tc('create.validationWarning.basic.minScore', [
              formatCompactNumber(space.filters.minScore),
              space.symbol
            ])
          }}
        </span>
      </span>
      <span v-else>
        {{
          $t(
            space.validation.params.rules ||
              'create.validationWarning.customValidation'
          )
        }}
      </span>
      <div>
        <BaseLink :link="{ name: 'spaceAbout', params: { key: space.id } }">
          {{ $t('learnMore') }}
        </BaseLink>
      </div>
    </BaseMessageBlock>
  </div>
</template>
