<script setup lang="ts">
defineProps({
  nft: {
    type: Object,
    required: true,
    default() {
      return {
        space: { id: '1.eth' },
        author: { id: '0x123' },
        title: 'qwe',
        id: 1,
        collection: '0x123',
        proposal: {
          id: 1,
          title: 'qwe'
        }
      };
    }
  }
});
</script>

<template>
  <div>
    <pre>{{ nft }}</pre>
  </div>
</template>
