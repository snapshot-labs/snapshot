<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const { web3Account } = useWeb3();
const {
  mintCurrency,
  mintPrice,
  mintCount,
  mintCountTotal,
  minting,
  init,
  inited
} = useNFTClaimer(props.space, props.proposal);

const isModalMintOpen = ref(false);
const isModalExploreOpen = ref(false);

watch(
  () => web3Account.value,
  to => {
    if (to) init();
  },
  {
    immediate: true
  }
);
</script>

<template>
  <BaseBlock v-if="inited" :title="$t('NFT Claimer')">
    <div class="flex flex-col items-center space-y-4">
      <div class="group flex cursor-pointer flex-col">
        <div
          class="flex h-[186px] w-[186px] flex-row items-center justify-center rounded-xl border border-skin-link bg-skin-border"
          @click="isModalExploreOpen = true"
        >
          <BaseIcon
            name="snapshot"
            size="50"
            class="text-primary group-hover:text-snapshot"
          />
        </div>
        <span class="mt-4 text-center text-skin-link">
          {{ proposal.title }}
        </span>
      </div>

      <SpaceProposalNFTProgress
        :max-supply="mintCountTotal"
        :supply="mintCount"
        @click="isModalExploreOpen = true"
      />

      <BaseBlock class="w-full">
        <div
          class="flex w-full flex-row content-center items-center justify-between"
        >
          <div class="flex flex-col">
            <span>Mint price</span>
            <span class="text-lg font-bold text-skin-link"
              >{{ mintPrice }} {{ mintCurrency }}</span
            >
          </div>
          <BaseButton
            primary
            :loading="minting"
            @click="isModalMintOpen = true"
          >
            MINT
          </BaseButton>
        </div>
      </BaseBlock>
    </div>
  </BaseBlock>

  <teleport to="#modal">
    <SpaceProposalNFTMintModal
      :open="isModalMintOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalMintOpen = false"
    />
    <SpaceProposalNFTExploreModal
      :open="isModalExploreOpen"
      :space="space"
      :proposal="proposal"
      @close="isModalExploreOpen = false"
      @mint="(isModalExploreOpen = false), (isModalMintOpen = true)"
    />
  </teleport>
</template>
