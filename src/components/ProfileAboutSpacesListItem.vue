<script setup lang="ts">
defineProps<{
  space: { name: string; id: string };
}>();
</script>

<template>
  <router-link
    :to="{
      name: 'spaceProposals',
      params: { key: space.id }
    }"
  >
    <div class="flex justify-center">
      <div
        class="flex justify-center !border-[1px] rounded-full !border-skin-text p-[2px]"
      >
        <AvatarSpace :space="space" symbolIndex="space" size="48" />
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-xs truncate">
        {{ space?.name }}
      </div>
      <IconVerifiedSpace
        :spaceId="space.id"
        size="14"
        class="text-primary pl-1"
      />
    </div>
  </router-link>
</template>
