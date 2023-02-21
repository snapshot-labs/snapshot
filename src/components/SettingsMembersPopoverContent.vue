<script setup lang="ts">
import capitalize from 'lodash/capitalize';

defineProps<{
  isAbleToChangeAdmins: boolean;
  isAbleToChangeMembers: boolean;
  currentRole: string;
}>();

const emit = defineEmits(['change']);
</script>

<template>
  <div class="my-2">
    <div v-for="role in ['admin', 'moderator', 'author']" :key="role">
      <div
        class="flex items-center px-3 py-2"
        :class="[
          (isAbleToChangeMembers &&
            (role === 'author' || role === 'moderator')) ||
          (isAbleToChangeAdmins && role === 'admin')
            ? 'cursor-pointer hover:bg-skin-border'
            : 'hover:bg-skin-background cursor-not-allowed'
        ]"
        @click="emit('change', role)"
      >
        <div class="">
          <div class="font-semibold text-skin-heading">
            {{ capitalize(role) }}
          </div>
          <span class="opacity-80">
            {{ $t(`settings.members.${role}.description`) }}
          </span>
        </div>
        <div class="px-3">
          <i-ho-check v-if="currentRole === role" />
        </div>
      </div>
    </div>
  </div>
</template>
