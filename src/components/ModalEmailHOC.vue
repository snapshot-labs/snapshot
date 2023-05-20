<script setup lang="ts">
const { isSubscribed } = useEmailSubscription();
</script>

<template>
  <ModalEmailSubscription v-if="!isSubscribed" />
  <ModalEmailManagement v-else />
</template>
