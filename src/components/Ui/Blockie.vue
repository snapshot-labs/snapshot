<script setup>
import { computed } from 'vue';
import makeBlockie from 'ethereum-blockies-base64';

const props = defineProps({
  seed: {
    type: String,
    default: 'randomString'
  }
});

const blockie = computed(() => makeBlockie(props.seed));
</script>

<template>
  <img :src="blockie" />
</template>
