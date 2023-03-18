<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import { shorten, explorerUrl } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import { Proposal, SpaceStrategy } from '@/helpers/interfaces';

defineProps<{
  strategy: SpaceStrategy;
  proposal?: Proposal;
  showDelete?: boolean;
  showEdit?: boolean;
}>();

defineEmits(['delete', 'edit']);
</script>

<template>
  <BaseBlock slim class="group mb-3 p-4 text-skin-link">
    <div class="items-center justify-between sm:flex">
      <h3 v-text="strategy.name" />
      <div class="my-3 flex">
        <div
          class="flex shrink flex-row-reverse items-center gap-3 sm:my-0 sm:flex-row"
        >
          <BaseButtonIcon v-if="showDelete" @click="$emit('delete')">
            <i-ho-trash />
          </BaseButtonIcon>
          <BaseButtonIcon v-if="showEdit" @click="$emit('edit')">
            <i-ho-pencil />
          </BaseButtonIcon>
          <ButtonPlayground
            :name="strategy.name"
            :network="strategy.network || proposal?.network"
            :params="strategy.params"
            :snapshot="proposal?.snapshot"
          />
        </div>
      </div>
    </div>

    <div>
      <div v-if="strategy.network" class="flex justify-between">
        <span class="mr-1 flex-auto text-skin-text"> network </span>
        <span
          v-text="networks[strategy.network || proposal?.network || 'x']?.name"
        />
      </div>
      <div v-for="(param, key) in strategy.params" :key="key" class="flex">
        <span class="mr-1 flex-auto text-skin-text" v-text="key" />
        <BaseLink
          v-if="
            key === 'address' || (typeof param === 'string' && isAddress(param))
          "
          :link="explorerUrl(strategy.network || proposal?.network, param as string)"
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
</template>
