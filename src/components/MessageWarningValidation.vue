<script setup lang="ts">
const props = defineProps<{
  context: 'voting' | 'proposal';
  spaceId: string;
  validationName: string;
  validationParams: Record<string, any>;
  minScore: number;
  symbol: string;
}>();

const { formatCompactNumber } = useIntl();

const tPath = computed(() => {
  if (props.context === 'voting') {
    return 'votingValidation';
  }
  return 'proposalValidation';
});

const operatorGitcoin = computed(() => {
  switch (props.validationParams?.operator) {
    case 'AND':
      return 'all';
    case 'OR':
      return 'one';
    default:
      return 'any';
  }
});
</script>

<template>
  <BaseMessageBlock level="warning">
    <template v-if="validationName === 'basic'">
      {{
        $t(`${tPath}.basic.invalidMessage`, {
          amount: formatCompactNumber(minScore),
          symbol
        })
      }}

      <BaseLink :link="{ name: 'spaceAbout', params: { key: spaceId } }">
        {{ $t('learnMore') }}
      </BaseLink>
    </template>

    <template v-else-if="validationName === 'passport-gated'">
      <template v-if="validationName === 'passport-gated'">
        {{
          $t(`${tPath}.passport-gated.invalidMessage`, {
            operator: operatorGitcoin,
            stamps:
              validationParams?.stamps.length === 0
                ? 'any valid Stamp'
                : validationParams?.stamps.join(', '),
            scoreThreshold: validationParams?.scoreThreshold || 0
          })
        }}
      </template>

      <BaseLink link="https://passport.gitcoin.co/#/dashboard">
        Gitcoin Passport</BaseLink
      >
    </template>

    <template v-else>
      {{ $t(`${tPath}.notValidMessage`) }}
      <BaseLink :link="{ name: 'spaceAbout', params: { key: spaceId } }">
        {{ $t('learnMore') }}
      </BaseLink>
    </template>
  </BaseMessageBlock>
</template>
