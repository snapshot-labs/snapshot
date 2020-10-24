<template>
  <Block>
    <div class="d-flex flex-items-baseline">
      <h3>
        <a v-text="network.name" :href="network.explorer" target="_blank" />
      </h3>
      <div v-text="network.chainId" class="ml-1" />
    </div>
    <div>In {{ _numeral(network.spaces.length) }} space(s)</div>
  </Block>
</template>

<script>
export default {
  props: ['network']
};
</script>
