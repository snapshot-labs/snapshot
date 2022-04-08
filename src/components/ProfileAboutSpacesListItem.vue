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
      <AvatarSpace :space="space" symbolIndex="space" size="44" />
    </div>
    <div class="text-xs truncate">
      {{ space?.name }}
    </div>
  </router-link>
</template>
