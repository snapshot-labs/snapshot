<script setup lang="ts">
defineProps<{
  isAbleToChangeAdmins: boolean;
  isAbleToChangeMembers: boolean;
  selectedRole: string;
  isAdmin?: boolean;
}>();
</script>

<template>
  <InputSelect
    v-if="!isAbleToChangeMembers || (isAdmin && !isAbleToChangeAdmins)"
    title=""
    :model-value="selectedRole"
    class="cursor-not-allowed"
    @click.stop
  />
  <InputSelect v-else title="" :model-value="selectedRole" />
</template>
