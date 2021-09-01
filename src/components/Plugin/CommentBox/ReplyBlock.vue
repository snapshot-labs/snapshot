<script setup>
import { defineProps, toRef, computed, ref, defineEmits } from 'vue';
const props = defineProps({
  item: Object,
  space: Object,
  profiles: Object,
  mainThread:String
});
const emit = defineEmits(['deleteItem','updateItem','replyComment']);
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
const closeModal = ref(false);
function selectFromThreedotDropdown(e) {
  if (e === 'edit') {
    toggleEditComment.value = false;
    toggleComment.value = true;
  }
  if (e === 'delete') {
    closeModal.value = true;
  }
}
</script>
<template>
  <UiModal :open="closeModal" @close="closeModal = false">
    <template v-slot:header>
      <h3>Delete Comment</h3>
    </template>
    <div class="text-center mt-4">
      <p>are you sure you want to delete?</p>
    </div>
    <div
      class="mb-2"
      style="
        text-align: center;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
      "
    >
      <UiButton class="bg-red text-white">Yes</UiButton>
      <UiButton class="ml-2">No</UiButton>
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :editComment="item.markdown"
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment = true"
    />
  </div>
  <div v-if="toggleEditComment">
    <PluginCommentBoxBlock :slim="true" class="p-4 text-color mt-2 mb-0">
      <span
        style="cursor: pointer"
        class="State mb-2 text-normal"
        @click="toggleReplyTo = !toggleReplyTo"
        v-if="mainThread!==item.reply_thread_id"
      >
      
        reply to
        <span
          v-if="profiles[item.reply_to]?.name"
          class="mt-3"
          v-text="profiles[item.reply_to].name"
        />
        <span
          v-else-if="profiles[item.reply_to]?.ens"
          v-text="profiles[item.reply_to].ens"
        />
        <span v-else v-text="_shorten(item.reply_to)" />
      </span>
      <PluginCommentBoxBlock v-if="toggleReplyTo" slim="true">
        <div class="ml-2 mt-2">
          comment by
          <User
            :address="item.reply_to"
            :profile="profiles[item.reply_to]"
            :space="space"
            class="d-inline-block"
          />
        </div>

        <div class="border-bottom"></div>
        <div class="ml-2 mt-2"><UiMarkdown :body="item.reply" /></div>
      </PluginCommentBoxBlock>
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block"
        />
        <UiDropdown
          top="2.5rem"
          right="1.3rem"
          class="float-right"
          @select="selectFromThreedotDropdown"
          :items="threeDotItems"
        >
          <div class="pr-3">
            <UiLoading v-if="dropdownLoading" />
            <Icon
              v-else
              name="threedots"
              size="25"
              class="v-align-text-bottom"
            />
          </div>
        </UiDropdown>
      </div>

      <UiMarkdown :body="item.markdown" />
      <div class="mt-1">
        <span
          :aria-label="_ms(item.timestamp / 1e3)"
          v-text="$d(item.timestamp, 'short', 'en-US')"
          class="link-color tooltipped tooltipped-n"
        /><span v-if="item.edit_timestamp" :aria-label="$d(item.edit_timestamp, 'short', 'en-US')" class="tooltipped tooltipped-n">(edited)</span>
      </div>
    </PluginCommentBoxBlock>
    <UiButton
      @click="toggleComment = !toggleComment"
      class="p-1 rounded-0 ml-2"
      style="line-height: 0px; height: auto"
    >
      <Icon :name="'receipt-outlined'" class="v-align-middle" size="18" />
      <div class="d-inline-block ml-1">reply</div>
    </UiButton>
    <PluginCommentBoxComment
      v-if="!toggleComment"
      buttonName="Reply"
      @dismissComment="toggleComment = true"
      @replyComment="$emit('replyComment')"
      :item="item"
      :mainThread="mainThread"
      method="replyComment"
      placeholder="add your reply here"
    />
  </div>
</template>
