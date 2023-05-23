<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { shorten, explorerUrl } from '@/helpers/utils';
import { TokenAsset } from '@/helpers/interfaces';

const props = defineProps<{
  token: TokenAsset;
  isSelected: boolean;
}>();

const emit = defineEmits(['select']);

const logoNotFound = ref(false);

const exploreUrl = computed(() => {
  let network = '1';
  if (props.token.verified !== undefined)
    network = String(props.token.verified.chainId);
  return explorerUrl(network, props.token.address);
});
</script>

<template>
  <button
    class="flex h-[64px] w-full cursor-pointer flex-row flex-wrap content-center items-center justify-between border-b border-skin-border px-4 py-2 hover:bg-skin-border"
    :class="{
      '!bg-skin-border': isSelected
    }"
    @click="emit('select', token)"
  >
    <div class="flex flex-row items-center">
      <div class="flex w-[44px] flex-col">
        <AvatarToken
          :src="token.address === 'main' ? String(token.logoUri) : ''"
          :address="token.address"
          size="32"
        />
      </div>

      <div class="flex flex-col items-start">
        <span class="text-skin-link">{{ token.symbol }}</span>
        <span class="text-skin-text">{{ shorten(token.name, 'choice') }}</span>
      </div>
    </div>

    <div class="flex h-full flex-col items-end justify-end">
      <BasePopover
        v-if="token.verified || token.address === 'main'"
        placement="top-end"
      >
        <template #button>
          <div
            class="flex flex-row items-center gap-x-1 text-skin-text hover:!text-skin-link"
          >
            <i-ho-check-badge class="!text-[22px] text-xs text-green" />
          </div>
        </template>
        <template #content>
          <div class="m-4">
            <p>
              Information of this token has been verified by Snapshot.
              <a href="https://docs.snapshot.org/" target="_blank">
                Click for more info.
              </a>
            </p>
          </div>
        </template>
      </BasePopover>
      <a
        v-if="token.address !== 'main'"
        :href="exploreUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mr-1 flex flex-row content-center items-center gap-x-1 text-skin-text hover:!text-skin-link"
        @click.stop
      >
        <span class="">{{ shorten(token.address) }}</span>
        <i-ho-arrow-top-right-on-square class="mb-1 text-xs" />
      </a>
      <div v-else>Ethereum</div>
    </div>
  </button>
</template>
