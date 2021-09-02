<script setup>
import { defineProps, toRef,computed,ref,onMounted,onBeforeUpdate,watch } from 'vue';

const props = defineProps({
  space: Object,
  profiles: Object,
 allReply:Array,
 mainThread:String,
 lastPage:String,
 loadingMore:Boolean
});
const emit = defineEmits(['deleteItem','updateItem','replyComment','loadMore']);
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
const listReply = ref({})
onBeforeUpdate(() => {
        listReply.value = {}
      })
function goto(index) {
  try{
const element = listReply.value[index];
      const child=element.querySelector("div > div > div > div.border-top")
      child.classList.remove("block-bg")
      child.classList.add("goto")
      const top = element.offsetTop;
      window.scrollTo(0, top-79);
      setTimeout(()=>{child.classList.remove("goto");child.classList.add("block-bg");},1000)
  }catch(e){
// console.log("")
  }
      
      
    }
const showIt=ref(false)
const loadIt=ref(false)
watch(()=>props.allReply,()=>{
 loadIt.value=false;
})
</script>
<style lang="scss">
.goto {
  animation-name: fade-to-black;
  animation-duration: 1s;
}

@keyframes fade-to-black {
  0% {background-color: grey }
    100% {background-color: var(--bg-color)}
  
  
}
html{scroll-behavior: smooth;}
</style>
<template>
<div v-if="allReply.length>0" @click="showIt=!showIt" class="ml-2 mt-2 d-inline-block" style="color: blue; cursor: pointer">
      {{showIt?"hide":"show"}} replies ({{allReply.length}})
    </div>
 
  <div v-show="showIt" class="pl-4" :ref="el => { if (el) listReply[item.key] = el }"  :key="index" v-for="(item, index) in allReply">
       <PluginCommentBoxReplyBlock
    
        :item="item"
      :profiles="profiles"
      :space="space"
      :mainThread="mainThread"
      @replyComment="$emit('replyComment',$event)"
       @updateItem="$emit('updateItem',$event)"
       @deleteItem="$emit('deleteItem',$event)"
      @scrollTo="goto($event)"
    />
  </div>

  <div @click="$emit('loadMore');loadIt=true;" v-if="lastPage&&showIt&&!loadIt" class="ml-5 mt-2 d-inline-block" style="color:blue;cursor:pointer;">load more...</div>
  <RowLoading v-if="loadingMore" class="my-2" />
</template>
<style>

</style>