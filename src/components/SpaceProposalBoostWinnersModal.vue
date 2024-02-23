<script setup lang="ts">
import { BoostSubgraph } from '@/helpers/boost/types';
import { getWinners } from '@/helpers/boost/api';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  open: boolean;
  boost: BoostSubgraph;
}>();

defineEmits(['close']);

const { web3Account } = useWeb3();
const { formatNumber, getNumberFormatter } = useIntl();
const searchInput = ref('');
const loading = ref(false);

const winners = ref();
const prize = ref();

const formattedPrize = computed(() => {
  if (!prize.value) return '0';
  const formattedPrize = formatUnits(prize.value, props.boost.token.decimals);
  return formatNumber(
    +formattedPrize,
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const sortedWinners = computed(() => {
  if (!winners.value) return [];
  return winners.value
    .filter(winner =>
      winner.toLowerCase().includes(searchInput.value.toLowerCase())
    )
    .sort((a, b) => {
      if (a.toLowerCase() === web3Account.value.toLowerCase()) return -1;
      if (b.toLowerCase() === web3Account.value.toLowerCase()) return 1;
      return 0;
    });
});

watch(
  () => props.open,
  async () => {
    if (props.open) {
      try {
        loading.value = true;
        const response = await getWinners(
          props.boost.strategy.proposal,
          props.boost.id,
          props.boost.chainId
        );
        winners.value = response.winners;
        prize.value = response.prize;
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
  }
);
</script>

<template>
  <TuneModal :open="open" @close="$emit('close')">
    <TuneModalTitle as="h4" class="flex items-center gap-1 m-3">
      Winners
      <TuneTag
        v-if="winners"
        :label="winners.length"
        class="leading-none rounded-full px-2"
      />
    </TuneModalTitle>
    <BaseSearch
      v-model="searchInput"
      placeholder="Search by address"
      modal
      class="!pl-3"
    />
    <div
      class="p-3 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[488px] overflow-y-auto"
    >
      <TuneLoadingSpinner v-if="loading" class="mx-auto h-[24px]" />
      <template v-else>
        <div v-for="winner in sortedWinners" :key="winner.id">
          <div class="flex justify-between">
            <BaseUser :address="winner" />
            {{ formattedPrize }}
            {{ props.boost.token.symbol }}
          </div>
        </div>
      </template>
    </div>
    <div class="p-3">
      <TuneButton class="w-full" @click="$emit('close')"> Close </TuneButton>
    </div>
  </TuneModal>
</template>
