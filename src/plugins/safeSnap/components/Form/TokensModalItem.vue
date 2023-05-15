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
    class="flex w-full cursor-pointer flex-row flex-wrap content-center items-center justify-between rounded-xl border border-skin-border p-3 hover:border-skin-link"
    :class="{
      '!border-skin-link': isSelected
    }"
    @click="emit('select', token)"
  >
    <div class="mb-2 flex w-full flex-row justify-between">
      <div class="flex flex-row content-center items-center gap-x-2">
        <img
          v-if="!logoNotFound"
          :src="token.logoUri"
          alt="token-logo"
          class="w-[34px] min-w-[34px]"
          @error="logoNotFound = true"
        />
        <div
          v-else
          class="flex h-[34px] w-[34px] flex-row items-center justify-center rounded-2xl bg-skin-text"
        >
          <small class="text-skin-link">{{
            token.name.slice(0, 3).toLocaleUpperCase()
          }}</small>
        </div>
        <span class="text-skin-link">{{ token.symbol }}</span>
        <span class="text-skin-text">{{ shorten(token.name, 'choice') }}</span>
      </div>
      <div class="flex flex-row content-center items-center gap-x-1">
        <template v-if="token.verified || token.address === 'main'">
          <BasePopover placement="top-end">
            <template #button>
              <div
                class="flex flex-row items-center gap-x-1 text-skin-text hover:!text-skin-link"
              >
                <span>{{ $t('verified') }}</span>
                <i-ho-check-badge class="text-xs text-green" />
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
        </template>

        <template v-else>
          <BasePopover placement="top-end">
            <template #button>
              <div
                class="flex flex-row items-center gap-x-1 text-skin-text hover:!text-skin-link"
              >
                <span>{{ $t('unverified') }}</span>
                <i-ho-question-mark-circle class="text-xs" />
              </div>
            </template>
            <template #content>
              <div class="m-4">
                <p>
                  Information of this token has NOT been verified by Snapshot.
                  <a href="https://tally.so/r/mKzXo7" target="_blank">
                    Click to verify token.
                  </a>
                </p>
              </div>
            </template>
          </BasePopover>
        </template>
      </div>
    </div>

    <div class="flex w-full flex-row items-center justify-between">
      <div>
        <span>{{ networks[token?.verified?.chainId || '1']?.name }}</span>
      </div>
      <a
        v-if="token.address !== 'main'"
        :href="exploreUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-row content-center items-center gap-x-1 text-skin-text hover:!text-skin-link"
        @click.stop
      >
        <span class="">{{ shorten(token.address) }}</span>
        <i-ho-arrow-top-right-on-square class="mb-1 text-xs" />
      </a>
    </div>
  </button>
</template>
