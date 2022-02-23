<script setup>
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils.ts';

const props = defineProps({ open: Boolean, space: Object });

const emit = defineEmits(['close']);

const getIpfsUrl = getUrl(props.space.terms ?? '');

function accept() {
  emit('accept');
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('settings.terms') }}</h3>
    </template>
    <div class="text-center my-2 p-4">
      <h4 class="mb-3">
        {{ $tc('mustAgreeToTerms', [space.name]) }}
      </h4>
      <BaseLink :link="space.terms">
        <UiText :text="getIpfsUrl" :truncate="35" />
      </BaseLink>
    </div>
    <template v-slot:footer>
      <div class="w-2/4 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="w-2/4 float-left pl-2">
        <UiButton @click="accept" type="submit" class="w-full" primary>
          {{ $t('agree') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
