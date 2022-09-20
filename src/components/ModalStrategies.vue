<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import { shorten, explorerUrl } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { Proposal, SpaceStrategy } from '@/helpers/interfaces';

defineProps<{
  open: boolean;
  strategies: { [key: string]: SpaceStrategy };
  proposal: Proposal;
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('strategiesPage') }}</h3>
    </template>
    <div class="m-4">
      <BaseBlock
        v-for="(strategy, i) in strategies"
        :key="i"
        slim
        class="mb-3 p-4 text-skin-link"
      >
        <div class="flex items-center justify-between">
          <h3 v-text="strategy.name" />

          <ButtonPlayground
            :name="strategy.name"
            :network="strategy.network || proposal.network"
            :params="strategy.params"
            :snapshot="proposal.snapshot"
            @close="$emit('close')"
          />
        </div>

        <div>
          <div v-if="strategy.network" class="flex justify-between">
            <span class="mr-1 flex-auto text-skin-text"> network </span>
            <span
              v-text="networks[strategy.network || proposal.network].name"
            />
          </div>
          <div v-for="(param, key) in strategy.params" :key="key" class="flex">
            <span class="mr-1 flex-auto text-skin-text" v-text="key" />
            <BaseLink
              v-if="
                key === 'address' ||
                (typeof param === 'string' && isAddress(param))
              "
              :link="explorerUrl(strategy.network || proposal.network, param as string)"
              class="block"
            >
              <span v-text="shorten(param as string)" />
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
