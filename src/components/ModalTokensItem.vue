<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { TokenlistToken } from '@/helpers/interfaces';

const props = defineProps<{
  token: TokenlistToken;
  isSelected: boolean;
  network: string;
}>();

const emit = defineEmits(['select']);

const exploreUrl = computed(() => {
  return explorerUrl(props.network, props.token.address);
});
</script>

<template>
  <button
    class="flex h-[64px] w-full cursor-pointer items-center justify-between border-b border-skin-border px-3 py-2 hover:bg-skin-border sm:px-4"
    :class="{
      '!bg-skin-border': isSelected
    }"
    @click="emit('select', token)"
  >
    <div class="flex items-center">
      <div class="mr-3 flex">
        <AvatarToken :address="token.address" size="38" />
      </div>

      <div class="pr-4">
        <div class="flex w-full items-center text-skin-link">
          <div class="flex items-center gap-1">
            {{ token.symbol }}
          </div>
        </div>
        <span class="line-clamp-1 text-left text-skin-text">
          {{ token.name }}
        </span>
      </div>
    </div>

    <div class="h-full text-right flex items-end">
      <div>
        <BaseLink v-if="exploreUrl" :link="exploreUrl" @click.stop>
          {{ shorten(token.address) }}</BaseLink
        >
      </div>
    </div>
  </button>
</template>
