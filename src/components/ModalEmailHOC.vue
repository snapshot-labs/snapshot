<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
const { isSubscribed } = useEmailSubscription();
</script>

<template>
  {{ isSubscribed }}
  <ModalEmailSubscription v-if="!isSubscribed" v-bind="$attrs" />
  <ModalEmailManagement v-else v-bind="$attrs" />
</template>
