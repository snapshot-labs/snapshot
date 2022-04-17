<script setup>
import { isAddress } from '@ethersproject/address';
import { shorten, explorerUrl } from '@/helpers/utils';
import { encode } from '@/helpers/b64';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

defineProps({
  open: Boolean,
  strategies: Object,
  proposal: Object
});

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('strategiesPage') }}</h3>
    </template>
    <div class="m-4">
      <BaseBlock
        slim
        v-for="(strategy, i) in strategies"
        :key="i"
        class="p-4 mb-3 text-skin-link"
      >
        <router-link
          class="float-right mt-2 pt-1"
          target="_blank"
          :to="{
            name: 'playground',
            params: { name: strategy.name },
            query: {
              query: encode(
                JSON.stringify({
                  network: strategy.network || proposal.network,
                  snapshot: proposal.snapshot,
                  params: strategy.params
                })
              )
            }
          }"
        >
          <BaseIcon name="play" size="18" />
        </router-link>
        <h3 v-text="strategy.name" />
        <div>
          <div v-for="(option, key) in strategy.params" :key="key" class="flex">
            <span v-text="key" class="flex-auto text-skin-text mr-1" />
            <BaseLink
              v-if="key === 'address' || isAddress(option)"
              :link="explorerUrl(proposal.network, option)"
              class="block"
            >
              <span v-text="shorten(option)" />
            </BaseLink>
            <span
              v-else
              v-text="
                ['string', 'number', 'boolean'].includes(typeof option)
                  ? option
                  : typeof option
              "
            />
          </div>
          <div class="flex">
            <span class="flex-auto text-skin-text mr-1"> network </span>
            <span>{{
              networks[strategy.network || proposal.network].name
            }}</span>
          </div>
        </div>
      </BaseBlock>
    </div>
  </BaseModal>
</template>
