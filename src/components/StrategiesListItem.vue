<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import { shorten, explorerUrl } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import { Proposal, SpaceStrategy } from '@/helpers/interfaces';

const props = defineProps<{
  strategy: SpaceStrategy;
  proposal?: Proposal;
  showDelete?: boolean;
  showEdit?: boolean;
}>();

defineEmits(['delete', 'edit']);

const { domain } = useApp();
const router = useRouter();

function openStrategy() {
  if (domain) {
    return window.open(
      `https://snapshot.org/#/strategy/${props.strategy.name}`,
      '_blank'
    );
  }
  const strategyRoute = router.resolve({
    name: 'strategy',
    params: { name: props.strategy.name }
  });
  window.open(strategyRoute.href, '_blank');
}
</script>

<template>
  <BaseBlock slim class="group mb-3 p-4 text-skin-link">
    <div class="items-center justify-between sm:flex">
      <h3 class="my-0 leading-5" v-text="strategy.name" />
      <div class="flex">
        <div
          class="-mx-[8px] my-2 flex shrink flex-row-reverse items-center gap-3 sm:my-0 sm:flex-row"
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
          <BaseButtonIcon @click="openStrategy()">
            <i-ho-information-circle />
          </BaseButtonIcon>
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
