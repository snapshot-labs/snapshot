<script setup>
import { ref, defineProps, onMounted, computed } from 'vue';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useProfiles } from '@/composables/useProfiles';
import { useNotifications } from '@/composables/useNotifications';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
  proposalId: String,
  space: Object,
  proposal: Object
});
const { notify } = useNotifications();
const auth = getInstance();
const { web3 } = useWeb3();
const { profiles } = useProfiles();
const web3Account = computed(() => web3.value.account);
const { modalAccountOpen } = useModal();
const loading = ref(false);
const comment = ref('');
const allData = ref([]);
const loadingMore = ref(false);
const togglePreview = ref(true);
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET'
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const lastPage = ref(false);
const isLast = ref(false);
async function getCommentData() {
  try {
    if (allData.value.length > 0) loadingMore.value = true;

    if (!lastPage.value && !isLast.value && allData.value.length > 0) {
      loadingMore.value = false;
      return;
    }
    const lastPageCondition = isLast.value ? `?last=${lastPage.value}` : '';
    const res = await getData(
      `https://uia5m1.deta.dev/all/${props.proposalId}${lastPageCondition}`
    );
    if (res.status) {
      const resData = res.data.items.filter(
        a => allData.value.findIndex(b => b.key === a.key) < 0
      );
      allData.value = allData.value.concat(resData).sort((a, b) => {
        return Number(a.timestamp) - Number(b.timestamp);
      });
      lastPage.value = res.data.last;
      if (res.data.last) {
        isLast.value = true;
      } else {
        isLast.value = false;
      }
    }
    loadingMore.value = false;
  } catch (e) {
    loadingMore.value = false;
  }
}
const { endElement } = useScrollMonitor(() => getCommentData());
onMounted(async () => {
  getCommentData();
});

async function clickSubmit() {
  !web3Account.value ? (modalAccountOpen.value = true) : handleSubmit();
}

async function postData(url = '', data = {}, authorization) {
  // Default options are marked with *

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json;charset=UTF-8',
      ...authorization
    }
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function handleSubmit() {
  if (loading.value) return;
  try {
    loading.value = true;
    const token = localStorage.getItem('_commentBox.token');
    let sig;
    const msg = {
      author: web3Account.value,
      markdown: comment.value,
      proposal_id: props.proposalId
    };
    if (!token)
      sig = await signMessage(
        auth.web3,
        JSON.stringify(msg),
        web3Account.value
      );
    const res = await postData(
      `https://uia5m1.deta.dev/add`,
      {
        address: web3Account.value,
        msg: JSON.stringify(msg),
        sig
      },
      token ? { authorization: token } : null
    );
    loading.value = false;
    if (res.refresh) throw new Error('refresh');
    if (!res.status) return notify(['primary', t('comment_box.error')]);
    comment.value = '';
    if (res.token) localStorage.setItem('_commentBox.token', res.token);
    allData.value.push(res.data);
  } catch (e) {
    if (e.message === 'refresh') {
      localStorage.removeItem('_commentBox.token');
      handleSubmit();
      return;
    }
    loading.value = false;
    notify(['primary', t('comment_box.error')]);
  }
}

function updateItem(data) {
  allData.value[allData.value.findIndex(a => a.key === data.key)] = data;
}
function deleteItem(key) {
  // console.log(allData.value.findIndex(a=>a.key===key))
  allData.value.splice(
    allData.value.findIndex(a => a.key === key),
    1
  );
}
</script>
<template>
  <Block :title="$t('comment_box.title')">
    <UiButton
      v-if="togglePreview"
      class="flex w-full px-3 !h-auto cursor-default"
    >
      <TextareaAutosize
        v-model="comment"
        :placeholder="$t('comment_box.add')"
        class="input text-left w-full h-full"
        style="font-size: 18px"
        :minHeight="100"
      />
    </UiButton>
    <Block
      v-if="!togglePreview"
      slim="true"
      class="p-4 h6 text-color mt-2 mb-0"
    >
      <div>{{ comment }}</div>
    </Block>

    <UiButton
      @click="clickSubmit"
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
    >
      {{ $t(`comment_box.submit`) }}
    </UiButton>
    <UiButton
      @click="togglePreview = !togglePreview"
      class="ml-2 mt-2 button--primary"
      :disabled="comment.length === 0"
      >{{
        togglePreview
          ? $t(`comment_box.preview`)
          : $t(`comment_box.continue_editing`)
      }}</UiButton
    >
    <div :key="index" v-for="(item, index) in allData">
      <PluginCommentBoxCommentBlock
        :proposal="proposal"
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

    <RowLoading v-if="loadingMore" class="my-2" />
  </Block>
</template>
