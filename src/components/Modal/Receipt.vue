<script setup>
import { getIpfsUrl } from '@/helpers/utils';

defineProps({
  open: Boolean,
  authorIpfsHash: String,
  relayerIpfsHash: Object
});
defineEmits(['close']);
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('receipt') }}</h3>
    </template>
    <div class="m-4 space-y-4">
      <div class="p-4 border rounded-md link-color">
        <div class="flex">
          <span v-text="$t('author')" class="flex-auto text-color mr-1" />
          <a
            :href="getIpfsUrl(authorIpfsHash)"
            target="_blank"
            class="link-color"
          >
            #{{ authorIpfsHash.slice(0, 7) }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div v-if="relayerIpfsHash" class="flex">
          <span v-text="$t('relayer')" class="flex-auto text-color mr-1" />
          <a
            :href="getIpfsUrl(relayerIpfsHash)"
            target="_blank"
            class="link-color"
          >
            #{{ relayerIpfsHash.slice(0, 7) }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
      </div>
      <a
        :href="`https://signator.io/view?ipfs=${authorIpfsHash}`"
        target="_blank"
        class="mb-2 block"
      >
        <UiButton class="button-outline w-full">
          {{ $t('verifyOnSignatorio') }}
          <Icon name="external-link" class="ml-1" />
        </UiButton>
      </a>
    </div>
  </UiModal>
</template>
