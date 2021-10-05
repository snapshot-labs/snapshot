<script setup>
import { ref, onBeforeUpdate, watch } from 'vue';

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
    console.log('dsa');
    const element = listReply.value[index];
    const child = element.querySelector('div > div > div > div.border-t');
    child.classList.remove('block-bg');
    child.classList.add('goto');
    const top = element.offsetTop;
    window.scrollTo(0, top - 79);
    setTimeout(() => {
      child.classList.remove('goto');
      child.classList.add('block-bg');
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
html {
  scroll-behavior: smooth;
}
</style>
<template>
  <div
    v-if="allReply.length > 0"
    @click="showIt = !showIt"
    class="ml-2 mt-2 d-inline-block"
    style="color: blue; cursor: pointer"
  >
    {{ showIt ? $t('comment_box.hide') : $t('comment_box.show') }}
    {{ $t('comment_box.replies') }} ({{ allReply.length }})
  </div>

  <div
    v-show="showIt"
    class="pl-4"
    :ref="
      el => {
        if (el) listReply[item.key] = el;
      }
    "
    :key="index"
    v-for="(item, index) in allReply"
  >
    <PluginCommentBoxReplyBlock
      :proposal="proposal"
      :item="item"
      :profiles="profiles"
      :space="space"
      :mainThread="mainThread"
      @replyComment="$emit('replyComment', $event)"
      @updateItem="$emit('updateItem', $event)"
      @deleteItem="$emit('deleteItem', $event)"
      @scrollTo="goto($event)"
    />
  </div>

  <div
    @click="
      $emit('loadMore');
      loadIt = true;
    "
    v-if="lastPage && showIt && !loadIt"
    class="ml-5 mt-2 d-inline-block"
    style="color: blue; cursor: pointer"
  >
    {{ $t('comment_box.load_more') }}...
  </div>
  <RowLoading v-if="loadingMore" class="my-2" />
</template>
<style></style>
