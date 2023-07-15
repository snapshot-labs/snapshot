<script setup lang="ts">
defineProps<{
  mint: any;
  proposal: any;
  network: string;
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
            <NFTClaimerOpenseaLink
              :network="network"
              :contract-address="mint.proposal.spaceCollection.id"
              :token="proposal.id"
            />
            <NFTClaimerEtherscanLink
              :network="network"
              :contract-address="mint.proposal.spaceCollection.id"
              :token="proposal.id"
            />
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
