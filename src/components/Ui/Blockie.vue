<script setup>
import { computed } from 'vue';
import makeBlockie from 'ethereum-blockies-base64';

const address = '0x000000000000000000000000000000000000dead';

const props = defineProps({
  seed: String
});

const blockie = computed(() => makeBlockie(props.seed || address));
</script>

<template>
  <img :src="blockie" />
</template>
