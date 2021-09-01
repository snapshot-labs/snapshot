<script setup>
import { defineProps, watch, computed, ref, defineEmits } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
const {modalOpen}=useModal()
const props = defineProps({
  item: Object,
  space: Object,
  profiles: Object,
  mainThread:String
});
const emit = defineEmits(['deleteItem','updateItem','replyComment','scrollTo']);
const toggleComment = ref(true);
const toggleReplyTo = ref(false);
const toggleEditComment = ref(true);
const loading = ref(false);
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
async function deleteData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'DELETE'
   });
  return response.json(); // parses JSON response into native JavaScript objects
}
const { notify } = useNotifications();
async function deleteItem() {
  if(loading.value) return
  try {
    loading.value = true;
    const res = await deleteData(`https://uia5m1.deta.dev/delete/${props.item.key}`);
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
    emit("deleteItem")
    closeModal.value = false;
    
    
    return;
  } catch (e) {
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}
watch([modalOpen,closeModal],()=>{
 const el = document.body;
  if(!closeModal.value){

    el.classList['remove']('overflow-hidden');
  }else if(closeModal.value&&!el.classList['contains']('overflow-hidden')){
    
    el.classList['add']('overflow-hidden');
  }
  
})
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
      <UiButton @click="deleteItem" :loading="loading" class="bg-red text-white">Yes</UiButton>
      <UiButton :disabled="loading" class="ml-2">No</UiButton>
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :item="item"
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment = true"
      @updateItem="$emit('replyComment')"
      method="edit"
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
          <span @click="$emit('scrollTo',item.reply_thread_id)" style="cursor:pointer;">
comment by
          <User
            :address="item.reply_to"
            :profile="profiles[item.reply_to]"
            :space="space"
            class="d-inline-block"
          /> <span v-if="item?.edited">(edited)</span> <span v-if="item?.deleted">(deleted)</span>
          </span>
          
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
        /> <span v-if="item.edit_timestamp" :aria-label="$d(item.edit_timestamp, 'short', 'en-US')" class="tooltipped tooltipped-n">(edited)</span>
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
      @updateItem="$emit('updateItem')"
      :item="item"
      :mainThread="mainThread"
      method="replyComment"
      placeholder="add your reply here"
    />
  </div>
</template>
