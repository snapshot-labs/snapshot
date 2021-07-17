<script setup>
import { defineProps, defineEmits } from 'vue';
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
      <a :href="space.terms" target="_blank" rel="noopener noreferrer">
        <UiText :text="getIpfsUrl" :truncate="35" />
        <Icon name="external-link" class="ml-1" />
      </a>
    </div>
    <template v-slot:footer>
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          @click="accept"
          type="submit"
          class="width-full button--submit"
        >
          {{ $t('agree') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
