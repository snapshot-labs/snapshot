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
        class="mb-3 p-4 text-skin-link"
      >
        <div class="flex items-center justify-between">
          <h3 v-text="strategy.name" />
          <router-link
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
            <BaseIcon name="play" size="18" class="flex" />
          </router-link>
        </div>

        <div>
          <div v-if="strategy.network" class="flex justify-between">
            <span class="mr-1 flex-auto text-skin-text"> network </span>
            <span
              v-text="networks[strategy.network || proposal.network].name"
            />
          </div>
          <div v-for="(param, key) in strategy.params" :key="key" class="flex">
            <span v-text="key" class="mr-1 flex-auto text-skin-text" />
            <BaseLink
              v-if="key === 'address' || isAddress(param)"
              :link="explorerUrl(strategy.network || proposal.network, param)"
              class="block"
            >
              <span v-text="shorten(param)" />
            </BaseLink>
            <BaseLink
              v-else-if="typeof param === 'string' && param.startsWith('http')"
              :link="param"
              class="ml-2 block truncate"
            >
              <span v-text="param" />
            </BaseLink>
            <span
              v-else
              class="ml-2 truncate"
              v-text="
                ['string', 'number', 'boolean'].includes(typeof param)
                  ? param
                  : typeof param
              "
            />
          </div>
        </div>
      </BaseBlock>
    </div>
  </BaseModal>
</template>
