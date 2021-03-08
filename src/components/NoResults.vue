<template>
  <div v-if="length < 1" class="mb-3 text-center">
    <Block v-if="block" class="pt-1">
      {{ text }}
    </Block>
    <div v-else>{{ text }}</div>
  </div>
</template>

<script>
export default {
  props: ['length', 'block'],
  computed: {
    text() {
      return this.$t('noResultsFound');
    }
  }
};
</script>
