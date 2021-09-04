<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, toRef,watch } from 'vue';
import { clone } from '@/helpers/utils';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
const {modalOpen,modalAccountOpen}=useModal()
const props = defineProps({
  placeholder: String,
  buttonName: String,
  item: Object,
  method: String,
  mainThread:String
});
const { web3 } = useWeb3();
const item2 = toRef(props, 'item');
const comment = ref(props.method==="edit" && item2.value?.markdown ? clone(item2.value?.markdown) : '');
const web3Account = computed(() => web3.value.account);
const loading = ref(false);
const togglePreview = ref(true);
const closeModal = ref(false);
const emit = defineEmits(['dismissComment', 'updateItem','replyComment']);
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
    headers: { 'Content-type': 'application/json;charset=UTF-8' }
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const { notify } = useNotifications();
async function updateItems() {
  if (loading.value) return;
  try {
    loading.value = true;
    const res = await postData(
      `https://uia5m1.deta.dev/update/${props.item.key}`,
      { markdown: comment.value }
    );
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
    
    emit('updateItem',res.data);
     emit("dismissComment")
    closeModal.value = false;
  
    return;
  } catch (e) {
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}
const chooseMethod = {
  edit: () => {
    if(!web3Account.value) return modalAccountOpen.value = true;
    closeModal.value = true;

  },
  replyComment:async function replyComment() {
    if(!web3Account.value) return modalAccountOpen.value = true;
  if (loading.value) return;
  try {
    loading.value = true;
    const res = await postData(
      `https://uia5m1.deta.dev/add_reply`,
      {   author: web3Account.value,
      markdown: comment.value,
      proposal_id: props.item.proposal_id,
      main_thread_id:props.mainThread,
      reply_to:props.item.author,
      reply_thread_id:props.item.key,
      reply:props.item.markdown 
      }
    );
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
     emit("dismissComment")
     emit("replyComment",res.data)
    return;
  } catch (e) {
    console.log(e.message)
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}
};
function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
 
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
  <UiModal :open="closeModal" @close="closeEvent">
    <template v-slot:header>
      <h3>Edit Comment</h3>
    </template>
    <div class="text-center mt-4">
      <p>are you sure you want to edit?</p>
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
      <UiButton
        class="bg-red text-white"
        :loading="loading"
        @click="updateItems"
        >Yes</UiButton
      >
      <UiButton @click="closeEvent" :disabled="loading" class="ml-2"
        >No</UiButton
      >
    </div>
  </UiModal>
  <div class="mt-2">
    <UiButton
      v-if="togglePreview"
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
      <TextareaAutosize
        v-model="comment"
        :placeholder="placeholder"
        class="input width-full text-left"
        style="font-size: 18px"
      />
    </UiButton>
    <PluginCommentBoxBlock
      v-if="!togglePreview"
      slim="true"
      class="p-4 h6 text-color mt-2 mb-0"
    >
      <UiMarkdown :body="comment" />
    </PluginCommentBoxBlock>
    <UiButton
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
      @click="chooseMethod[method]"
    >
      {{ buttonName }}
    </UiButton>
    <UiButton
      @click="togglePreview = !togglePreview"
      :disabled="comment.length === 0"
      class="ml-2 mt-2 button--primary"
    >
      {{ togglePreview ? 'Preview' : 'Continue Editing' }}
    </UiButton>
    <UiButton
      @click="$emit('dismissComment')"
      type="text"
      class="border-0 ml-2 mt-2 button--text"
    >
      Dismiss
    </UiButton>
  </div>
</template>
