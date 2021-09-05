<script setup>
import { defineProps, watch, computed, ref, defineEmits } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
const auth = getInstance();
const { modalOpen,modalAccountOpen } = useModal();
const { web3 } = useWeb3();
const web3Account = computed(() => web3.value.account);
const props = defineProps({
  item: Object,
  space: Object,
  profiles: Object,
  mainThread:String,
  proposal:Object
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
    if(!web3Account.value) return modalAccountOpen.value = true;
    closeModal.value = true;
  }
}
async function deleteData(url = '',data={},authorization) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-type': 'application/json;charset=UTF-8',...authorization}
   });
  return response.json(); // parses JSON response into native JavaScript objects
}
const { notify } = useNotifications();
async function deleteItem() {
  if(loading.value) return
  try {
    loading.value = true;
    let token = sessionStorage.getItem('token');
    let sig;
    let msg= { key: props.item.key };
        if(!token) sig = await signMessage(auth.web3, JSON.stringify(msg), web3Account.value);
    const res = await deleteData(`https://uia5m1.deta.dev/delete/` ,{
      address: web3Account.value,
      msg:JSON.stringify(msg),
      sig,
      space_id:props.space.key
    }
      ,token?{authorization:token}:null);
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
    if(res.token) sessionStorage.setItem('token', res.token);
    emit("deleteItem",props.item.key)
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
const isAdmin = computed(() => {
  const admins = props.space.admins.map(address => address.toLowerCase());
  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins.includes(web3Account.value.toLowerCase())
  );
});
const isOwner = computed(() => {
   return web3Account.value===props.item.author;
    
});
const isCreator = computed(() => props.proposal.author === web3Account.value);
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
      <UiButton :disabled="loading" @click="closeModal=false" class="ml-2">No</UiButton>
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :item="item"
      :space="space"
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment = true"
      @updateItem="$emit('updateItem',$event)"
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
        <div class="ml-2 mt-2"><PluginCommentBoxMarkdown :body="item.reply" /></div>
      </PluginCommentBoxBlock>
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block"
        />
        <UiDropdown
         v-if="isAdmin || isOwner || isCreator"
          top="2.5rem"
          right="1.3rem"
          class="float-right"
          @select="selectFromThreedotDropdown"
          :items="threeDotItems"
        >
          <div class="pr-3">
           
            <Icon
         
              name="threedots"
              size="25"
              class="v-align-text-bottom"
            />
          </div>
        </UiDropdown>
      </div>

      <PluginCommentBoxMarkdown :body="item.markdown" />
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
      :space="space"
      @dismissComment="toggleComment = true"
      @replyComment="$emit('replyComment',$event)"
      @updateItem="$emit('updateItem',$event)"
      :item="item"
      :mainThread="mainThread"
      method="replyComment"
      placeholder="add your reply here"
    />
  </div>
</template>
