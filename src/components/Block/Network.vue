<template>
  <Block>
    <div class="d-flex flex-items-center mb-1">
      <img
        v-if="imgValid"
        class="circle border mr-2 mb-2"
        :src="getLogoUrl(network.key)"
        @error="imgValid = false"
        width="28"
        height="28"
      />
      <jazzicon
        v-else
        :seed="network.key"
        :diameter="26"
        class="d-inline-block line-height-0 mr-2 mb-2"
      />
      <h3 v-text="network.name" />
      <div v-text="network.key" class="ml-1 text-gray" />
    </div>
    <div class="text-gray">
      {{ $tc('inSpaces', [_n(network.spaces.length)]) }}
    </div>
  </Block>
</template>

<script>
export default {
  props: ['network'],
  data() {
    return {
      imgValid: true
    };
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${this.network.key}.png`;
    }
  }
};
</script>
