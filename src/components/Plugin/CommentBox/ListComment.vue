<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
const props = defineProps({
  profiles: Object,
  space: Object,
  allData: Array
});
const emit=defineEmits(["deleteItem","updateItem","replyComment"])
</script>
<template>
  
  <div :key="index" v-for="(item, index) in allData">
    <PluginCommentBoxCommentBlock
      :item="item"
      :profiles="profiles"
      :space="space"
      @deleteItem="$emit('deleteItem')"
      @updateItem="$emit('updateItem')"
    />
  
  </div>
</template>
