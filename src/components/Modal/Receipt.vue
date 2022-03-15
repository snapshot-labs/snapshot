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
      <Block slim class="p-4 text-skin-link">
        <div class="flex">
          <span v-text="$t('author')" class="flex-auto text-skin-text mr-1" />
          <BaseLink :link="getIpfsUrl(authorIpfsHash)" class="text-skin-link">
            #{{ authorIpfsHash.slice(0, 7) }}
          </BaseLink>
        </div>
        <div v-if="relayerIpfsHash" class="flex">
          <span v-text="$t('relayer')" class="flex-auto text-skin-text mr-1" />
          <BaseLink :link="getIpfsUrl(relayerIpfsHash)" class="text-skin-link">
            #{{ relayerIpfsHash.slice(0, 7) }}
          </BaseLink>
        </div>
      </Block>
      <BaseLink
        :link="`https://signator.io/view?ipfs=${authorIpfsHash}`"
        class="mb-2 block"
        hide-external-icon
      >
        <UiButton class="button-outline w-full">
          {{ $t('verifyOnSignatorio') }}
          <Icon name="external-link" class="ml-1" />
        </UiButton>
      </BaseLink>
    </div>
  </UiModal>
</template>
