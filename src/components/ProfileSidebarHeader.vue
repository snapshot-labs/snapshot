<script setup lang="ts">
import { onMounted } from 'vue';
import { useProfiles } from '@/composables/useProfiles';
import { shorten } from '@/helpers/utils';
import { useCopy } from '@/composables/useCopy';

const props = defineProps<{
  userAddress: string;
}>();

const { loadProfiles, profiles } = useProfiles();
const { copyToClipboard } = useCopy();

onMounted(() => {
  loadProfiles([props.userAddress]);
});
</script>

<template>
  <div class="mt-3">
    <div class="flex justify-center">
      <BaseAvatar size="80" :address="userAddress" />
    </div>
    <div class="text-center">
      <div class="text-skin-link text-xl">
        {{ profiles?.[userAddress]?.name ?? 'Unknown' }}
      </div>
      <div class="flex justify-center">
        <div
          @click="copyToClipboard(userAddress)"
          class="flex items-center text-xs text-skin-link bg-skin-border px-2 rounded-full cursor-pointer"
        >
          {{ shorten(userAddress) }}
          <i-ho-duplicate class="ml-1 text-xs" />
        </div>
      </div>
    </div>
  </div>
</template>
