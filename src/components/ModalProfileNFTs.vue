<script setup lang="ts">
import { getProposals } from '@/helpers/nftClaimer';
import { BigNumber } from '@ethersproject/bignumber';
import { explorerUrl } from '@/helpers/utils';
import { openseaLink } from '@/helpers/nftClaimer';

const props = defineProps<{
  open: boolean;
  nfts: any[];
}>();

const { formatRelativeTime } = useIntl();
const inited = ref(false);
const proposals = ref({});

watch(
  () => props.open,
  () => props.open && init()
);

async function init() {
  const ids = props.nfts.map(n => BigNumber.from(n.proposal.id).toHexString());
  const results = await getProposals(ids);

  results.map(result => {
    proposals.value[BigNumber.from(result.id).toString()] = result;
  });

  inited.value = true;
}

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>NFTs</h3>
    </template>
    <div v-if="inited" class="space-y-3 py-4 md:px-4">
      <div v-for="n in nfts" :key="n">
        <BaseBlock>
          <div class="flex justify-between">
            <NFTClaimerLogo class="shrink-0" />
            <div class="mx-3 grow">
              <div class="flex items-start gap-x-3">
                <router-link
                  :to="{
                    name: 'spaceProposal',
                    params: {
                      key: proposals[n.proposal.id].space.id,
                      id: proposals[n.proposal.id].id
                    }
                  }"
                  class="grow"
                >
                  {{ proposals[n.proposal.id].title }}
                </router-link>
                <div class="flex gap-x-2">
                  <a
                    v-tippy="{ content: 'View this token on OpenSea' }"
                    class="flex flex-row"
                    :href="
                      openseaLink(
                        '5',
                        n.proposal.spaceCollection.id,
                        n.proposal.id
                      )
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
                        `${n.proposal.spaceCollection.id}?a=${n.proposal.id}`,
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
                  :space-id="proposals[n.proposal.id].space.id"
                  class="group grow text-skin-text"
                >
                  <div class="flex items-center">
                    <AvatarSpace
                      :space="proposals[n.proposal.id].space"
                      size="18"
                    />
                    <span
                      class="ml-2 group-hover:text-skin-link"
                      v-text="proposals[n.proposal.id].space.name"
                    />
                  </div>
                </LinkSpace>
                <span class="text-end">
                  {{ formatRelativeTime(n.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </BaseBlock>
      </div>
    </div>
  </BaseModal>
</template>
