<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  validationFailed: boolean;
  isValidAuthor: boolean;
  validationName: string;
  containsShortUrl: boolean;
}>();

const { web3, web3Account } = useWeb3();
const { isGnosisAndNotSpaceNetwork } = useGnosis(props.space);
const { errorFetchingSnapshot } = useSnapshot();

const minScore = computed(
  () =>
    props.space?.validation?.params?.minScore ||
    props.space?.filters?.minScore ||
    0
);

const strategySymbolsString = computed(() => {
  const strategies = props.space.validation?.params?.strategies
    ? props.space.validation.params.strategies
    : props.space.strategies;

  let symbols = strategies
    ?.map(strategy => strategy.params.symbol)
    .filter(symbol => symbol);

  if (symbols.length === 0) return '';

  symbols = symbols.map(symbol => `$${symbol}`);

  if (symbols.length === 1) return `${symbols[0]}`;

  return `(${symbols.join(', ')})`;
});
</script>

<template>
  <div class="mb-4 space-y-2">
    <MessageWarningGnosisNetwork
      v-if="isGnosisAndNotSpaceNetwork"
      :space="space"
      action="create"
      is-responsive
    />

    <BaseMessageBlock
      v-else-if="errorFetchingSnapshot"
      level="warning"
      is-responsive
    >
      {{ $t('create.errorGettingSnapshot') }}
      <BaseLink link="https://discord.snapshot.org/">
        {{ $t('learnMore') }}
      </BaseLink>
    </BaseMessageBlock>

    <BaseMessageBlock
      v-else-if="
        !web3Account &&
        !web3.authLoading &&
        (props.space.validation.name || space.filters.onlyMembers)
      "
      level="warning"
      is-responsive
    >
      {{ $t('proposalValidation.notConnectedMessage') }}
      <div>
        <BaseLink :link="{ name: 'spaceAbout', params: { key: space.id } }">{{
          $t('learnMore')
        }}</BaseLink>
      </div>
    </BaseMessageBlock>

    <!-- Shows when wallet is connected and executing validation fails (e.g.
      due to misconfigured strategy)  -->

    <BaseMessageBlock
      v-else-if="validationFailed"
      level="warning"
      is-responsive
    >
      {{ $t('proposalValidation.executionError') }}
    </BaseMessageBlock>

    <!-- Shows when wallet is connected and doesn't pass validation -->
    <BaseMessageBlock
      v-else-if="isValidAuthor === false && space?.filters.onlyMembers"
      level="warning"
    >
      <span>
        {{ $t('proposalValidation.onlyMemberMessage') }}
      </span>
    </BaseMessageBlock>
    <MessageWarningValidation
      v-else-if="isValidAuthor === false && validationName"
      context="proposal"
      :space-id="space.id"
      :validation-name="validationName"
      :validation-params="space.validation?.params || {}"
      :min-score="minScore"
      :symbol="strategySymbolsString || space.symbol"
    />

    <BaseMessageBlock v-else-if="containsShortUrl" level="warning">
      {{ $t('warningShortUrl') }}
    </BaseMessageBlock>
  </div>
</template>
