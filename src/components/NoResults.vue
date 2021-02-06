<template>
  <div v-if="results.length < 1" class="mb-3 text-center">
    <Block v-if="block" class="pt-1">
      Sorry, we can't find any results
    </Block>
  </div>
</template>

<script>
export default {
  props: ['results', 'block']
};
</script>
