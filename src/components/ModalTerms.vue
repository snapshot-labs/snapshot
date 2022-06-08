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
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('settings.terms') }}</h3>
    </template>
    <div class="my-2 p-4 text-center">
      <h4 class="mb-3">
        {{ $tc('mustAgreeToTerms', [space.name]) }}
      </h4>
      <BaseLink :link="space.terms">
        <TextAutolinker :text="getIpfsUrl" :truncate="35" />
      </BaseLink>
    </div>
    <template v-slot:footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton @click="accept" type="submit" class="w-full" primary>
          {{ $t('agree') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
