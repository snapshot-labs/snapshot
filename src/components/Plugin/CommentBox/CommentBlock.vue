<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, watch } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
const { modalOpen } = useModal();
const props = defineProps({
  profiles: Object,
  space: Object,
  item: Object
});
const threeDotItems = computed(() => {
  const items = [
    { text: 'edit', action: 'edit' },
    { text: 'delete', action: 'delete' }
  ];

  return items;
});
const toggleComment = ref(true);
const toggleEditComment = ref(true);
const closeModal = ref(false);
const loading = ref(false);
function selectFromThreedotDropdown(e) {
  if (e === 'edit') {
    toggleEditComment.value = false;
    toggleComment.value = true;
  }
  if (e === 'delete') {
    closeModal.value = true;
    const el = document.body;
    el.classList['remove']('overflow-hidden');
  }
}
const emit = defineEmits(['deleteItem', 'updateItem', 'replyComment']);
async function deleteData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'DELETE'
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const { notify } = useNotifications();
async function deleteItem() {
  if (loading.value) return;
  try {
    loading.value = true;
    const res = await deleteData(
      `https://uia5m1.deta.dev/delete/${props.item.key}`
    );
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
    emit('deleteItem',props.item.key);
    closeModal.value = false;

    return;
  } catch (e) {
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}

function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
}
async function updateItem(e) {
  toggleEditComment.value = true;
  emit('updateItem',e);
}
watch([modalOpen, closeModal], () => {
  const el = document.body;
  if (!closeModal.value) {
    el.classList['remove']('overflow-hidden');
  } else if (closeModal.value && !el.classList['contains']('overflow-hidden')) {
    el.classList['add']('overflow-hidden');
  }
});
const allReply = ref([]);
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET' // *GET, POST, PUT, DELETE, etc.
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const lastPage = ref(false);
async function getReplyData() {
  const lastPageCondition = lastPage.value ? `?last=${lastPage.value}` : '';
  const res = await getData(
    `https://uia5m1.deta.dev/all_reply/${props.item.proposal_id}/${props.item.key}${lastPageCondition}`
  );
  if (res.status && !lastPage.value) {
    const resData=res.data.items.filter(a=>allReply.value.findIndex(b=>b.key===a.key)<0)
    allReply.value = allReply.value.concat(resData).sort((a, b) => {
      return Number(a.timestamp) - Number(b.timestamp);
    });
    lastPage.value = res.data.last;
  } else {
    const resData=res.data.items.filter(a=>allReply.value.findIndex(b=>b.key===a.key)<0)
    allReply.value = allReply.value.concat(resData).sort((a, b) => {
      return Number(a.timestamp) - Number(b.timestamp);
    });
    lastPage.value = res.data.last;
  }
}
onMounted(async () => {
  getReplyData();
});
function updateItemReply(data){
  console.log(data)
allReply.value[allReply.value.findIndex(a=>a.key===data.key)]=data;
}
function deleteItemReply(key){
allReply.value.splice(allReply.value.findIndex(a=>a.key===key),1)
}
</script>
<template>
  <UiModal :open="closeModal" @close="closeEvent">
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
      <UiButton class="bg-red text-white" :loading="loading" @click="deleteItem"
        >Yes</UiButton
      >
      <UiButton @click="closeEvent" :disabled="loading" class="ml-2"
        >No</UiButton
      >
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :item="item"
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment = true"
      @updateItem="updateItem($event)"
      method="edit"
    />
  </div>
  <div v-if="toggleEditComment">
    <PluginCommentBoxBlock :slim="true" class="p-4 text-color mt-2 mb-0">
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
        />
        <span
          v-if="item.edit_timestamp"
          :aria-label="$d(item.edit_timestamp, 'short', 'en-US')"
          class="tooltipped tooltipped-n"
          > (edited)</span
        >
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
      @replyComment="allReply.push($event)"
      :item="item"
      :mainThread="item.key"
      method="replyComment"
      placeholder="add your reply here"
    />
  </div>
  <PluginCommentBoxListReply
    :profiles="profiles"
    :space="space"
    :allReply="allReply"
    :lastPage="lastPage"
    :mainThread="item.key"
    @replyComment="allReply.push($event)"
    @updateItem="updateItemReply($event)"
    @deleteItem="deleteItemReply($event)"
    @loadMore="getReplyData"
  />
</template>
