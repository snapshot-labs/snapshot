<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { useWeb3 } from '@/composables/useWeb3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useRoute } from 'vue-router';
import { useProfiles } from '@/composables/useProfiles';
import { useNotifications } from '@/composables/useNotifications';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
const props = defineProps({
  proposalId: String,
  space: Object,
  proposal: Object
});
const { notify } = useNotifications();
const auth = getInstance();
const { web3 } = useWeb3();
const route = useRoute();
const key = route.params.key;
const { profiles } = useProfiles();
const web3Account = computed(() => web3.value.account);
const isAdmin = computed(() => {
  const admins = props.space.admins.map(address => address.toLowerCase());
  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins.includes(web3Account.value.toLowerCase())
  );
});

const loading = ref(false);
const comment = ref('');
const allData = ref([]);
const togglePreview = ref(true);
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET' // *GET, POST, PUT, DELETE, etc.
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const lastPage=ref(false)
const isLast=ref(false)
async function getCommentData() {
  if(!lastPage.value&&!isLast.value&&allData.value.length>0){
      return
    }
    const lastPageCondition = isLast.value ? `?last=${lastPage.value}` : '';
  const res = await getData(
    `https://uia5m1.deta.dev/all/${props.proposalId}${lastPageCondition}`
  );
  if (res.status) {
    
    const resData=res.data.items.filter(a=>allData.value.findIndex(b=>b.key===a.key)<0)
    allData.value = allData.value.concat(resData).sort((a, b) => {
      return Number(a.timestamp) - Number(b.timestamp);
    });
    lastPage.value = res.data.last;
    if(res.data.last) {isLast.value=true;}else{isLast.value=false}
  } 
  
}
const { endElement } = useScrollMonitor(() =>
getCommentData()
);
onMounted(async () => {
  getCommentData();
});

function clickSubmit() {
  !web3Account.value ? (modalAccountOpen.value = true) : handleSubmit();
}
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-type': 'application/json;charset=UTF-8' }
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function handleSubmit() {
  if (loading.value) return;
  try {
    loading.value = true;
    const res = await postData(`https://uia5m1.deta.dev/add`, {
      author: web3Account.value,
      markdown: comment.value,
      proposal_id: props.proposalId
    });
    comment.value = '';
    loading.value = false;
    if (!res.status) return notify(['red', 'Oops, something went wrong']);
      allData.value.push(res.data)
  } catch (e) {
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}
const { modalAccountOpen } = useModal();

const closeModal = ref(false);
function updateItem(data){
  allData.value[allData.value.findIndex(a=>a.key===data.key)]=data;
}
function deleteItem(key){
  allData.value.splice(allData.value.findIndex(a=>a.key===key),1);
}
</script>
<template>
  <Block title="Comment Box">
    <UiButton
      v-if="togglePreview"
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
      <TextareaAutosize
        v-model="comment"
        :placeholder="`Add your comment here`"
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
      @click="clickSubmit"
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
    >
      Submit
    </UiButton>
    <UiButton
      @click="togglePreview = !togglePreview"
      class="ml-2 mt-2 button--primary"
      :disabled="comment.length === 0"
      >{{ togglePreview ? 'Preview' : 'Continue Editing' }}</UiButton
    >
     <div :key="index" v-for="(item, index) in allData">
    <PluginCommentBoxCommentBlock
      :item="item"
      :profiles="profiles"
      :space="space"
          @updateItem="updateItem($event)"
      @deleteItem="deleteItem($event)"
    />
  
  </div>
   <div
        style="height: 10px; width: 10px; position: absolute"
        ref="endElement"
      />
    <!-- <PluginCommentBoxListComment
      @updateItem="updateItem($event)"
      @deleteItem="deleteItem($event)"
      :allData="allData"
      :profiles="profiles"
      :space="space"
      :loadMore="loadMore"
      :loading="loading"
      @getComment="getCommentData"
    /> -->
  </Block>
</template>
