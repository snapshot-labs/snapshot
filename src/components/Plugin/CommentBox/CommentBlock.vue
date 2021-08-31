<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
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
  }
}
const emit = defineEmits(['deleteItem','finishEdit']);
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

function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
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
      <UiButton class="bg-red text-white" :loading="loading" @click="deleteItem">Yes</UiButton>
      <UiButton @click="closeEvent" :disabled="loading" class="ml-2"
        >No</UiButton
      >
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :editComment="item.markdown"
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment = true"
      @finishEdit="toggleEditComment = true"
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
        /> <span v-if="item.edit_timestamp" :aria-label="$d(item.timestamp, 'short', 'en-US')" class="tooltipped tooltipped-n">(edited)</span>
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
      placeholder="add your reply here"
    />
  </div>
</template>
