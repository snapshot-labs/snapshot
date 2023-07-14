<script setup lang="ts">
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import { Space, RankedSpace, ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  space: Space | RankedSpace | ExtendedSpace;
  action: string;
}>();

const emit = defineEmits(['accept', 'close']);

const getIpfsUrl = getUrl(props.space.terms ?? '');

function accept() {
  emit('accept');
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('settings.terms.label') }}</h3>
    </template>
    <div class="py-4 text-center md:p-4">
      <BaseMessageBlock is-responsive level="info" class="mb-4 text-left">
        {{
          $tc('modalTerms.mustAgreeTo', {
            action,
            spaceName: space.name || 'spaces'
          })
        }}
      </BaseMessageBlock>

      <BaseLink :link="space.terms!">
        <TextAutolinker :text="getIpfsUrl" :truncate="35" />
      </BaseLink>
    </div>
    <template #footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton type="button" class="w-full" @click="$emit('close')">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton class="w-full" primary @click="accept">
          {{ $t('agree') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
