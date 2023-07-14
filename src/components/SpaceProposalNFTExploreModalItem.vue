<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { explorerUrl } from '@/helpers/utils';
import { openseaLink } from '@/helpers/nftClaimer';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  mint: any;
  contractInfo: any;
  collectionInfo: any;
  mintNetwork: string;
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
    <BaseLink
      :link="
        explorerUrl(
          mintNetwork,
          `${contractInfo.address}?a=${collectionInfo.id}`,
          'token'
        )
      "
      :hide-external-icon="true"
      title="View this token on Etherscan"
    >
      <IconEtherscan />
    </BaseLink>
    <BaseLink
      :link="openseaLink(mintNetwork, contractInfo.address, collectionInfo.id)"
      :hide-external-icon="true"
      title="View this token on Opensea"
    >
      <IconOpensea />
    </BaseLink>
  </div>
</template>
