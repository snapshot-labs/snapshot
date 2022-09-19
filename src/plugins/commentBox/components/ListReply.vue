<script setup>
import { ref, onBeforeUpdate, watch } from 'vue';
import CommentBoxReplyBlock from './ReplyBlock.vue';

const props = defineProps({
  space: Object,
  profiles: Object,
  allReply: Array,
  mainThread: String,
  lastPage: String,
  loadingMore: Boolean,
  proposal: Object
});

const listReply = ref({});
onBeforeUpdate(() => {
  listReply.value = {};
});
function goto(index) {
  try {
    const element = listReply.value[index];
    const child = element.querySelector('div > div > div > div.border-t');
    child.classList.remove('bg-skin-block-bg');
    child.classList.add('goto');
    const top = element.offsetTop;
    window.scrollTo(0, top - 79);
    setTimeout(() => {
      child.classList.remove('goto');
      child.classList.add('bg-skin-block-bg');
    }, 1000);
  } catch (e) {
    console.log(e.message);
  }
}
const showIt = ref(false);
const loadIt = ref(false);
watch(
  () => props.allReply,
  () => {
    loadIt.value = false;
  }
);
</script>
<style lang="scss">
.goto {
  animation-name: fade-to-black;
  animation-duration: 1s;
}

@keyframes fade-to-black {
  0% {
    background-color: grey;
  }
  100% {
    background-color: var(--bg-color);
  }
}
</style>

<template>
  <div
    v-if="allReply.length > 0"
    class="d-inline-block ml-2 mt-2"
    style="cursor: pointer"
    @click="showIt = !showIt"
  >
    {{ showIt ? $t('comment_box.hide') : $t('comment_box.show') }}
    {{ $t('comment_box.replies') }} ({{ allReply.length }})
  </div>

  <div
    v-for="(item, index) in allReply"
    v-show="showIt"
    :ref="
      el => {
        if (el) listReply[item.key] = el;
      }
    "
    :key="index"
    class="pl-4"
  >
    <CommentBoxReplyBlock
      :proposal="proposal"
      :item="item"
      :profiles="profiles"
      :space="space"
      :main-thread="mainThread"
      @replyComment="$emit('replyComment', $event)"
      @updateItem="$emit('updateItem', $event)"
      @deleteItem="$emit('deleteItem', $event)"
      @scrollTo="goto($event)"
    />
  </div>

  <div
    v-if="lastPage && showIt && !loadIt"
    class="d-inline-block ml-5 mt-2"
    style="cursor: pointer"
    @click="
      $emit('loadMore');
      loadIt = true;
    "
  >
    {{ $t('comment_box.load_more') }}...
  </div>
  <LoadingRow v-if="loadingMore" class="my-2" />
</template>
