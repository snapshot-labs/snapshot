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

    <template
      v-else-if="
        validationName === 'passport-gated' ||
        validationName === 'passport-weighted'
      "
    >
      <template v-if="validationName === 'passport-gated'">
        {{
          $t(`${tPath}.passport-gated.invalidMessage`, {
            operator: validationParams?.operator === 'AND' ? 'all' : 'one',
            stamps: validationParams?.stamps.join(', ')
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

  <!-- <template v-if="validationName === 'passport-weighted' && proposal?.validation.params?.stamps.some(p => p.weight > 1)">
    <table class="mt-3 w-full">
      <caption>
        A list of stamps that can be used to increase your weight:
      </caption>
      <thead>
        <tr>
          <th class="w-2/3 py-1 text-left text-skin-link">Stamp</th>
          <th class="w-1/3 py-1 text-left text-skin-link">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="stamp in proposal.validation.params.stamps"
          :key="stamp.name"
        >
          <td class="py-1">{{ stamp.id }}</td>
          <td class="py-1">{{ stamp.weight }}</td>
        </tr>
      </tbody>
    </table>
  </template> -->
</template>
