<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { TokenAsset } from '@/helpers/interfaces';
import { ETH_CONTRACT } from '@/helpers/constants';

const props = defineProps<{
  token: TokenAsset;
  isSelected: boolean;
  network: string;
}>();

const emit = defineEmits(['select']);

const { formatNumber, getNumberFormatter } = useIntl();
const { copyToClipboard } = useCopy();

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
        <AvatarToken
          :address="token.address === 'main' ? ETH_CONTRACT : token.address"
          size="38"
        />
      </div>

      <div class="pr-4">
        <div class="flex w-full items-center text-skin-link">
          <div class="flex items-center gap-1">
            {{ token.symbol }}
            <i-ho-check-badge
              v-if="token.verified || token.address === 'main'"
              v-tippy="{ content: $t('verified') }"
              class="text-sm text-green"
            />
          </div>
        </div>
        <span class="line-clamp-1 text-left text-skin-text">
          {{ token.name }}
        </span>
      </div>
    </div>

    <div class="h-full text-right">
      <span v-if="token.address !== 'main'" class="text-skin-link">
        {{
          formatNumber(
            Number(token.balance),
            getNumberFormatter({ maximumFractionDigits: 6 }).value
          )
        }}
      </span>
      <div>
        <BaseLink
          v-if="token.address !== 'main' && exploreUrl"
          :link="exploreUrl"
          @click.stop
        >
          {{ shorten(token.address) }}</BaseLink
        >
      </div>
    </div>
  </button>
</template>
