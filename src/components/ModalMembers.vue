<script setup lang="ts">
import { Profile, Member } from '@/helpers/interfaces';

defineProps<{
  open: boolean;
  spaceMembers: Member[];
  profiles: Record<string, Profile>;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <template #header>
      <h3>Members</h3>
    </template>

    <AboutMembersListItem v-for="(mod, i) in spaceMembers" :key="i">
      <BaseUser :address="mod.id" :profile="profiles[mod.id]" />
      <div class="space-x-2">
        <BasePill
          v-if="mod.roles.includes('admin')"
          v-tippy="{ content: $t('settings.admins.information') }"
          class="cursor-help py-1"
        >
          admin
        </BasePill>
        <BasePill
          v-if="mod.roles.includes('author')"
          v-tippy="{ content: $t('settings.authors.information') }"
          class="cursor-help py-1"
        >
          author
        </BasePill>
      </div>
    </AboutMembersListItem>
  </BaseModal>
</template>
