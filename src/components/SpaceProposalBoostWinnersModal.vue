<script setup lang="ts">
import { BoostSubgraph } from '@/helpers/boost/types';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  open: boolean;
  boost: BoostSubgraph;
  winners: string[];
  prize: string;
}>();

defineEmits(['close']);

const { web3Account } = useWeb3();
const { formatNumber, getNumberFormatter } = useIntl();
const { loadProfiles, profiles } = useProfiles();

const searchInput = ref('');

const formattedPrize = computed(() => {
  if (!props.prize) return '0';
  const formattedPrize = formatUnits(props.prize, props.boost.token.decimals);
  return formatNumber(
    +formattedPrize,
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const sortedWinners = computed(() => {
  if (!props.winners) return [];
  return props.winners
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
  () => props.winners,
  () => {
    if (!props.winners) return;
    loadProfiles(props.winners);
  },
  { immediate: true }
);
</script>

<template>
  <TuneModal :open="open" @close="$emit('close')">
    <TuneModalTitle as="h4" class="flex items-center gap-1 m-3 mb-2">
      Winners
      <BaseCounter v-if="winners" :counter="winners.length" />
    </TuneModalTitle>
    <BaseSearch
      v-model="searchInput"
      placeholder="Search by address"
      modal
      class="!pl-3 pr-[12px]"
    />
    <div
      class="p-3 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[488px] overflow-y-auto"
    >
      <div
        v-if="winners.length === 0"
        class="pt-3 flex flex-col items-center text-center"
      >
        <i-ho-emoji-sad class="mb-1" />
        No winners due to no eligible votes.
      </div>
      <BaseNoResults v-else-if="sortedWinners.length === 0" class="!py-0" />
      <template v-else>
        <div v-for="winner in sortedWinners" :key="winner">
          <div class="flex justify-between">
            <BaseUser :address="winner" :profile="profiles[winner]" />
            {{ formattedPrize }}
            {{ props.boost.token.symbol }}
          </div>
        </div>
      </template>
    </div>
    <BaseMessage
      level="info"
      class="p-3 border bg-[--border-color-subtle] rounded-xl mx-3 mb-3"
    >
      Wondering how the winners are chosen? Check out
      <BaseLink link="https://docs.snapshot.org/user-guides/boost"
        >the docs</BaseLink
      >
    </BaseMessage>
    <div class="px-3 pb-3">
      <TuneButton class="w-full" @click="$emit('close')"> Close </TuneButton>
    </div>
  </TuneModal>
</template>
