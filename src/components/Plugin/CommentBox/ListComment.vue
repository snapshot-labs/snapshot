<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
const props = defineProps({
  profiles: Object,
  space: Object,
  allData: Array
});

</script>
<template>
  
  <div :key="index" v-for="(item, index) in allData">
    <PluginCommentBoxCommentBlock
      :item="item"
      :profiles="profiles"
      :space="space"
    />
    <div class="ml-2 mt-2 d-inline-block" style="color: blue; cursor: pointer">
      show replies (0)
    </div>
    <PluginCommentBoxListReply
      :reply="allData"
      :profiles="profiles"
      :space="space"
    />
  </div>
</template>
