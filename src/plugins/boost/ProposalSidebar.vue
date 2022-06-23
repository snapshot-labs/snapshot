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

const { web3Account, web3 } = useWeb3();
const { pluginIndex } = usePlugins();
const { loadBoosts, boosts, claimTokens, hasClaimed } = useBoost();
const load = async () => {
  const chainId =
    web3.value.network.chainId || import.meta.env.VITE_DEFAULT_NETWORK;
  await loadBoosts(props.proposal.id, chainId, web3Account.value);
};

onMounted(load);
watch(web3Account, load);
</script>

<template>
  <BaseBlock v-if="boosts.length" :title="pluginIndex.boost.name">
    <div v-for="boost in boosts" :key="boost.id">
      Boost balance: {{ formatEther(boost.balance) }}<br />
      Token: {{ boost.token }}<br />
      <div v-if="hasClaimed(boost, web3Account)">Already claimed!</div>
      <BaseButton
        v-else-if="boost.receipt"
        class="w-100"
        @click="claimTokens(boost)"
      >
        Claim {{ formatEther(boost.receipt.data.message.amount) }} tokens
      </BaseButton>
      <div v-else>Can't claim</div>
    </div>
  </BaseBlock>
</template>
