<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { formatEther } from '@ethersproject/units';
import { usePlugins } from '@/composables/usePlugins';
import { useWeb3 } from '@/composables/useWeb3';
import { useBoost } from './useBoost';

const props = defineProps<{
  space: Record<string, any>;
  proposal: Record<string, any>;
}>();

const { web3Account } = useWeb3();
const { pluginIndex } = usePlugins();
const {
  loadBoosts,
  boosts,
  requestClaimReceipt,
  hasReceiptForBoost,
  claimTokens
} = useBoost();

onMounted(async () => {
  await loadBoosts(props.proposal.id);

  if (web3Account.value) {
    for (const boost of boosts.value) {
      requestClaimReceipt(boost.id, web3Account.value, '1000000000000000000');
    }
  }
});

watch(web3Account, () => {
  if (web3Account.value) {
    requestClaimReceipt(1, web3Account.value, '1000000000000000000');
  }
});
</script>

<template>
  <BaseBlock v-if="boosts.length" :title="pluginIndex.boost.name">
    <div v-for="boost in boosts" :key="boost.id">
      Boost balance: {{ formatEther(boost.balance) }}<br />
      Token: {{ boost.token }}<br />
      <BaseButton
        v-if="hasReceiptForBoost(boost.id)"
        class="w-100"
        @click="claimTokens(boost.id)"
      >
        Claim
      </BaseButton>
      <div v-else>Can't claim</div>
    </div>
  </BaseBlock>
</template>
