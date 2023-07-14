<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';
import { openseaLink } from '@/helpers/nftClaimer';

defineProps<{
  mint: any;
  proposal: any;
}>();

const { formatRelativeTime } = useIntl();
</script>

<template>
  <BaseBlock>
    <div class="flex justify-between">
      <NFTClaimerLogo class="shrink-0" />
      <div class="mx-3 grow">
        <div class="flex items-start gap-x-3">
          <router-link
            :to="{
              name: 'spaceProposal',
              params: {
                key: proposal.space.id,
                id: proposal.id
              }
            }"
            class="grow"
          >
            {{ proposal.title }}
          </router-link>
          <div class="flex gap-x-2">
            <a
              v-tippy="{ content: 'View this token on OpenSea' }"
              class="flex flex-row"
              :href="
                openseaLink('5', mint.proposal.spaceCollection.id, proposal.id)
              "
              target="_blank"
            >
              <IconOpensea />
            </a>

            <a
              v-tippy="{ content: 'View this token on etherscan' }"
              class="flex flex-row"
              :href="
                explorerUrl(
                  '5',
                  `${mint.proposal.spaceCollection.id}?a=${proposal.id}`,
                  'token'
                )
              "
              target="_blank"
            >
              <IconEtherscan />
            </a>
          </div>
        </div>
        <div class="flex">
          <LinkSpace
            :space-id="proposal.space.id"
            class="group grow text-skin-text"
          >
            <div class="flex items-center">
              <AvatarSpace :space="proposal.space" size="18" />
              <span
                class="ml-2 group-hover:text-skin-link"
                v-text="proposal.space.name"
              />
            </div>
          </LinkSpace>
          <span class="text-end">
            {{ formatRelativeTime(mint.timestamp) }}
          </span>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
