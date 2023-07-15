<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  mint: any;
  contractInfo: any;
  collectionInfo: any;
  network: string;
}>();

const { formatRelativeTime } = useIntl();
</script>

<template>
  <NFTClaimerLogo />
  <div class="flex grow flex-col">
    <BaseUser
      :address="mint.minterAddress"
      :profile="mint.userProfile"
      :space="space"
      :proposal="proposal"
    />
    <span>{{ formatRelativeTime(mint.timestamp) }}</span>
  </div>
  <div class="flex gap-x-3">
    <NFTClaimerEtherscanLink
      :network="network"
      :contract-address="contractInfo.address"
      :token="collectionInfo.id"
    />
    <NFTClaimerOpenseaLink
      :network="network"
      :contract-address="contractInfo.address"
      :token="collectionInfo.id"
    />
  </div>
</template>
