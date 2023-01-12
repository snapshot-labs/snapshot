<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

defineProps<{
  isValidVoter: boolean;
  proposal: Proposal;
}>();
</script>

<template>
  <BaseMessageBlock level="warning">
    <template v-if="proposal.validation.name === 'passport-gated'">
      {{
        $t('validation.passport-gated.invalidVoterMessage', {
          amount: proposal.validation.params.operator === 'AND' ? 'all' : 'one',
          stamps: proposal.validation.params.stamps.join(', ')
        })
      }}
    </template>

    <BaseLink link="https://passport.gitcoin.co/#/dashboard">
      Gitcoin Passport</BaseLink
    >
  </BaseMessageBlock>
  <!-- Maybe needed for weighted passport -->
  <!-- 
    <BaseMessageBlock
    v-if="proposal?.validation.params?.stamps.some(p => p.weight > 1)"
    level="info"
  >
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
  </BaseMessageBlock> -->
</template>
