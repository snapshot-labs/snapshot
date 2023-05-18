<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
const { isSubscribed } = useEmailSubscription();
</script>

<template>
  <ModalEmailSubscription v-if="!isSubscribed" v-bind="$attrs" />
  <ModalEmailManagement v-else v-bind="$attrs" />
</template>
