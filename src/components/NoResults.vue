<template>
  <div v-if="results.length < 1" class="mb-3">
    No results found
  </div>
</template>

<script>
export default {
  props: ['results']
};
</script>
