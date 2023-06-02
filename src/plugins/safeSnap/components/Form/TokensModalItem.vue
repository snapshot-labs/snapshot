<script setup lang="ts">
import { shorten, explorerUrl } from '@/helpers/utils';
import { TokenAsset } from '@/helpers/interfaces';

const props = defineProps<{
  token: TokenAsset;
  isSelected: boolean;
}>();

const emit = defineEmits(['select']);

const { formatNumber } = useIntl();

const exploreUrl = computed(() => {
  let network = '1';
  if (props.token.verified) network = String(props.token.chainId);
  return explorerUrl(network, props.token.address);
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
          :src="token.address === 'main' ? String(token.logoUri) : ''"
          :address="token.address"
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
        {{ formatNumber(Number(token.balance)) }}
      </span>
      <a
        v-if="token.address !== 'main'"
        :href="exploreUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-row content-center items-center gap-x-1 text-skin-text hover:!text-skin-link"
        @click.stop
      >
        <span class="">{{ shorten(token.address) }}</span>
        <i-ho-external-link class="mb-1 text-xs" />
      </a>
    </div>
  </button>
</template>
