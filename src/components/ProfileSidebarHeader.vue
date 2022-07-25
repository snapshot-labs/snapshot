<script setup lang="ts">
defineProps<{
  userAddress: string;
  profile: { ens: string; name?: string; avatar?: string };
}>();
</script>

<template>
  <div class="flex truncate lg:mt-3 lg:block">
    <div class="flex lg:justify-center">
      <AvatarUser size="69" :address="userAddress" />
    </div>
    <div class="truncate lg:text-center">
      <ProfileName :profile="profile" :address="userAddress" />
      <ProfileAddressCopy
        :profile="profile"
        :user-address="userAddress"
        class="lg:justify-center"
      />
    </div>
  </div>
</template>
