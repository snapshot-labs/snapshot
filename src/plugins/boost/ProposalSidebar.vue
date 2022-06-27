<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { usePlugins } from '@/composables/usePlugins';
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';
import { useBoost } from './useBoost';

const props = defineProps<{
  space: Record<string, any>;
  proposal: Record<string, any>;
}>();

const { web3Account, web3 } = useWeb3();
const { pluginIndex } = usePlugins();
const { modalAccountOpen } = useModal();
const { loadBoosts, boosts, claimTokens, getClaim, getClaimTxLink } =
  useBoost();

const chainId =
  web3.value.network.chainId || import.meta.env.VITE_DEFAULT_NETWORK;

const load = async () => {
  await loadBoosts(props.proposal.id, chainId, web3Account.value);
};

onMounted(load);
watch(web3Account, load);
</script>

<template>
  <BaseBlock v-if="boosts.length" slim :title="pluginIndex.boost.name">
    <div v-if="!web3Account" class="p-4">
      <BaseButton class="w-full" @click="modalAccountOpen = true">
        {{ $t('connectWallet') }}
      </BaseButton>
    </div>
    <div v-if="web3Account" class="text-center">
      <div
        v-for="boost in boosts"
        :key="boost.id"
        class="border-b p-4 last:border-b-0"
      >
        <div v-if="getClaim(boost, web3Account)">
          {{ $t('boost.alreadyClaimed') }}<br />
          <BaseLink
            :link="getClaimTxLink(getClaim(boost, web3Account), chainId)"
          >
            {{ $t('boost.viewTx') }}
          </BaseLink>
        </div>
        <BaseButton
          v-else-if="boost.receipt"
          class="w-full"
          @click="claimTokens(boost)"
        >
          {{
            $t('boost.claimTokens', [
              formatUnits(
                boost.receipt.data.message.amount,
                boost.token.decimals
              ),
              boost.token.symbol
            ])
          }}
        </BaseButton>
        <div v-else>Nothing to claim.</div>
      </div>
    </div>
  </BaseBlock>
</template>
