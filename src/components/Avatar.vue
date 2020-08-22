<template>
  <jazzicon
    :address="address"
    :diameter="parseInt(size) || 22"
    class="d-inline-block v-align-middle line-height-0"
  />
</template>

<script>
export default {
  props: ['address', 'size']
};
</script>
