<script setup>
import { defineProps, toRef,computed,ref } from 'vue';
const props = defineProps({
  reply: Array,
  space: Object,
  profiles: Object
});
const toggleComment = ref(true);
const toggleEditComment = ref(true);
const toggleReplyTo = ref(false);
const threeDotItems = computed(() => {
  const items = [
    { text: 'edit', action: 'edit' },
    { text: 'delete', action: 'delete' }
  ];

  return items;
});
const closeModal=ref(false)
function selectFromThreedotDropdown(e) {
  if (e === 'edit') {
    toggleEditComment.value = false;
    toggleComment.value = true;
  }
  if(e==="delete") {
    closeModal.value=true
  }
}

</script>
<template>

  <div class="pl-4" :key="index" v-for="(item, index) in reply">
   
       <PluginCommentBoxReplyBlock
      :item="item"
      :profiles="profiles"
      :space="space"
    />
  </div>
  <div class="ml-5 mt-2 d-inline-block" style="color:blue;cursor:pointer;">load more...</div>
</template>
