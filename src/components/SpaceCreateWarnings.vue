<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useWeb3 } from '@/composables/useWeb3';

defineProps<{
  space: ExtendedSpace;
  executingValidationFailed: boolean;
  passValidation: (string | boolean)[];
}>();

const { formatCompactNumber } = useIntl();
const { web3, web3Account } = useWeb3();
</script>

<template>
  <div>
    <!-- Shows when no wallet is connected and the space has any sort
      of validation set -->
    <BaseMessageBlock
      class="mb-4"
      level="warning"
      v-if="
        !web3Account &&
        !web3.authLoading &&
        (space?.validation?.params.minScore ||
          space?.filters.minScore ||
          space?.filters.onlyMembers)
      "
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
      level="warning"
      v-else-if="executingValidationFailed"
      :routeObject="{ name: 'spaceAbout', params: { key: space.id } }"
      class="mb-4"
    >
      {{ $t('create.validationWarning.executionError') }}
    </BaseMessageBlock>

    <!-- Shows when wallet is connected and doesn't pass validaion -->
    <BaseMessageBlock
      level="warning"
      v-else-if="passValidation[0] === false"
      class="mb-4"
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
