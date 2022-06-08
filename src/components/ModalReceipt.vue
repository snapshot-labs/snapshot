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
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('receipt') }}</h3>
    </template>
    <div class="m-4 space-y-4">
      <BaseBlock slim class="p-4 text-skin-link">
        <div class="flex">
          <span v-text="$t('author')" class="mr-1 flex-auto text-skin-text" />
          <BaseLink :link="getIpfsUrl(authorIpfsHash)" class="text-skin-link">
            #{{ authorIpfsHash.slice(0, 7) }}
          </BaseLink>
        </div>
        <div v-if="relayerIpfsHash" class="flex">
          <span v-text="$t('relayer')" class="mr-1 flex-auto text-skin-text" />
          <BaseLink :link="getIpfsUrl(relayerIpfsHash)" class="text-skin-link">
            #{{ relayerIpfsHash.slice(0, 7) }}
          </BaseLink>
        </div>
      </BaseBlock>
      <BaseLink
        :link="`https://signator.io/view?ipfs=${authorIpfsHash}`"
        class="mb-2 block"
        hide-external-icon
      >
        <BaseButton class="w-full">
          {{ $t('verifyOnSignatorio') }}
          <BaseIcon name="external-link" class="ml-1" />
        </BaseButton>
      </BaseLink>
    </div>
  </BaseModal>
</template>
