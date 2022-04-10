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
  <div>
    <BaseAvatar size="80" :address="userAddress" />
    <div class="text-center mt-3">
      <div v-if="profiles?.[userAddress]?.name" class="text-skin-link">
        {{ profiles[userAddress].name }}
      </div>
      <div
        @click="copyToClipboard(userAddress)"
        class="cursor-pointer flex justify-center"
      >
        <div class="flex items-center">
          {{ shorten(userAddress) }}
          <BaseIcon name="copy" size="20" class="ml-1" />
        </div>
      </div>
    </div>
  </div>
</template>
