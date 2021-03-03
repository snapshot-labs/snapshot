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
  data() {
    return {
      text: "Oops, we can't find any results"
    };
  }
};
</script>
