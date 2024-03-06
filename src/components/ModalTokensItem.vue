<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { Token } from '@/helpers/alchemy';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  token: Token;
  isSelected: boolean;
  network: string;
}>();

const emit = defineEmits(['select']);
const { formatNumber, getNumberFormatter } = useIntl();

const exploreUrl = computed(() => {
  return explorerUrl(props.network, props.token.contractAddress);
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
        <AvatarToken :address="token.contractAddress" size="38" />
      </div>

      <div class="pr-4">
        <div class="flex w-full items-center text-skin-link">
          <div class="text-left text-skin-text line-clamp-1">
            {{ token.symbol }}
          </div>
        </div>
        <span class="line-clamp-1 text-left text-skin-text">
          {{ token.name }}
        </span>
      </div>
    </div>

    <div class="h-full text-right">
      <span class="text-skin-link">
        {{
          formatNumber(
            Number(formatUnits(token.tokenBalance, token.decimals)),
            getNumberFormatter({ maximumFractionDigits: 6 }).value
          )
        }}
      </span>
      <div>
        <BaseLink v-if="exploreUrl" :link="exploreUrl" @click.stop>
          {{ shorten(token.contractAddress) }}</BaseLink
        >
      </div>
    </div>
  </button>
</template>
