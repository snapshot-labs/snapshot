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
      {{
        $t(`${tPath}.passport-gated.invalidMessage`, {
          scoreThreshold: validationParams?.scoreThreshold || 0
        })
      }}<span v-if="props.validationParams?.operator === 'NONE'">. </span>

      <template v-else>
        {{
          $t(`${tPath}.passport-gated.invalidMessageStamps`, {
            operator:
              props.validationParams?.operator === 'AND' ? 'all' : 'one',
            stamps:
              validationParams.stamps && validationParams.stamps.join(', ')
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
