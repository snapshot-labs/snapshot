<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();
const auth = getInstance();
const { modalOpen, modalAccountOpen } = useModal();
const { web3Account } = useWeb3();
const props = defineProps({
  profiles: Object,
  space: Object,
  item: Object,
  proposal: Object
});
const threeDotItems = computed(() => {
  const items = [
    { text: t('comment_box.edit_button'), action: 'edit' },
    { text: t('comment_box.delete'), action: 'delete' }
  ];

  return items;
});
const isAdmin = computed(() => {
  const admins = props.space.admins.map(address => address.toLowerCase());
  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins.includes(web3Account.value.toLowerCase())
  );
});
const isOwner = computed(() => {
  return web3Account.value === props.item.author;
});
const isCreator = computed(() => props.proposal.author === web3Account.value);
const toggleComment = ref(true);
const toggleEditComment = ref(true);
const closeModal = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const allReply = ref([]);
function selectFromThreedotDropdown(e) {
  if (e === 'edit') {
    toggleEditComment.value = false;
    toggleComment.value = true;
  }
  if (e === 'delete') {
    if (!web3Account.value) return (modalAccountOpen.value = true);
    closeModal.value = true;
    const el = document.body;
    el.classList['remove']('overflow-hidden');
  }
}
const emit = defineEmits(['deleteItem', 'updateItem', 'replyComment']);
async function deleteData(url = '', data = {}, authorization) {
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
const { notify } = useNotifications();
async function deleteItem() {
  if (loading.value) return;
  try {
    console.log(props.space);
    loading.value = true;
    const token = localStorage.getItem(
      `_commentBox.token-${web3Account.value}`
    );
    let sig;
    const msg = { key: props.item.key };
    if (!token)
      sig = await signMessage(
        auth.web3,
        JSON.stringify(msg),
        web3Account.value
      );
    const res = await deleteData(
      `https://uia5m1.deta.dev/delete`,
      {
        address: web3Account.value,
        msg: JSON.stringify(msg),
        sig,
        space_id: props.space.id
      },
      token ? { authorization: token } : null
    );
    loading.value = false;
    if (res.refresh) throw new Error('refresh');
    if (!res.status) return notify(['primary', t('comment_box.error')]);
    if (res.token)
      localStorage.setItem(`_commentBox.token-${web3Account.value}`, res.token);
    allReply.value = 0;
    emit('deleteItem', props.item.key);
    closeModal.value = false;
    return;
  } catch (e) {
    if (e.message === 'refresh') {
      localStorage.removeItem(`_commentBox.token-${web3Account.value}`);
      deleteItem();
      return;
    }
    loading.value = false;
    notify(['primary', t('comment_box.error')]);
  }
}

function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
}
async function updateItem(e) {
  toggleEditComment.value = true;
  emit('updateItem', e);
}
watch([modalOpen, closeModal, () => props.item], (oldVal, newVal) => {
  if (oldVal[2].key !== newVal[2].key) {
    // console.log(newVal[2].markdown)
    getDataAfterDelete(props.item.key);
  }

  const el = document.body;
  if (!closeModal.value) {
    el.classList['remove']('overflow-hidden');
  } else if (closeModal.value && !el.classList['contains']('overflow-hidden')) {
    el.classList['add']('overflow-hidden');
  }
});

async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET'
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const lastPage = ref(false);
async function getDataAfterDelete(key) {
  try {
    const res = await getData(
      `https://uia5m1.deta.dev/all_reply/${props.item.proposal_id}/${key}`
    );
    if (res.status) {
      const resData = res.data.items;
      allReply.value = resData;
      lastPage.value = false;
    }
    loadingMore.value = false;
  } catch (e) {
    loadingMore.value = false;
  }
}

async function getReplyData() {
  try {
    const lastPageCondition = lastPage.value ? `?last=${lastPage.value}` : '';
    const res = await getData(
      `https://uia5m1.deta.dev/all_reply/${props.item.proposal_id}/${props.item.key}${lastPageCondition}`
    );
    if (res.status && !lastPage.value) {
      const resData = res.data.items.filter(
        a => allReply.value.findIndex(b => b.key === a.key) < 0
      );
      allReply.value = allReply.value.concat(resData).sort((a, b) => {
        return Number(a.timestamp) - Number(b.timestamp);
      });
      lastPage.value = res.data.last;
    } else {
      const resData = res.data.items.filter(
        a => allReply.value.findIndex(b => b.key === a.key) < 0
      );
      allReply.value = allReply.value.concat(resData).sort((a, b) => {
        return Number(a.timestamp) - Number(b.timestamp);
      });
      lastPage.value = res.data.last;
    }
    loadingMore.value = false;
  } catch (e) {
    loadingMore.value = false;
  }
}
onMounted(async () => {
  getReplyData();
});
function updateItemReply(data) {
  allReply.value[allReply.value.findIndex(a => a.key === data.key)] = data;
}
function deleteItemReply(key) {
  allReply.value.splice(
    allReply.value.findIndex(a => a.key === key),
    1
  );
}
</script>
<template>
  <UiModal :open="closeModal" @close="closeEvent">
    <template v-slot:header>
      <h3>{{ $t('comment_box.delete_comment') }}</h3>
    </template>
    <div class="text-center mt-3">
      <p>{{ $t('comment_box.delete_modal') }}</p>
    </div>
    <div
      class="mb-2 mt-3 text-center flex items-center content-center justify-center"
    >
      <UiButton
        class="!bg-primary !text-white"
        :loading="loading"
        @click="deleteItem"
        >{{ $t('comment_box.yes') }}</UiButton
      >
      <UiButton @click="closeEvent" :disabled="loading" class="ml-2">{{
        $t('comment_box.no')
      }}</UiButton>
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :space="space"
      :item="item"
      :buttonName="$t('comment_box.edit_button')"
      :placeholder="$t('comment_box.edit')"
      @dismissComment="toggleEditComment = true"
      @updateItem="updateItem($event)"
      method="edit"
    />
  </div>
  <div v-if="toggleEditComment">
    <Block :slim="true" class="p-4 text-color mt-2 mb-0">
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="inline-block"
        /><span
          v-text="$d(item.timestamp, 'short', 'en-US')"
          v-tippy="{
            content: formatRelativeTime(item.timestamp / 1e3)
          }"
          class="ml-1"
        />

        <UiDropdown
          v-if="isAdmin || isOwner || isCreator"
          top="2.5rem"
          right="1.3rem"
          class="float-right"
          @select="selectFromThreedotDropdown"
          :items="threeDotItems"
        >
          <div>
            <Icon name="threedots" size="25" class="v-align-text-bottom" />
          </div>
        </UiDropdown>
      </div>
      <div class="mt-2">{{ item.markdown }}</div>
    </Block>

    <UiButton
      @click="toggleComment = !toggleComment"
      class="p-1 rounded-0 mt-2"
      style="line-height: 0px; height: auto"
    >
      <Icon :name="'receipt-outlined'" class="v-align-middle" size="15" />
      <span class="ml-1">{{ $t('comment_box.reply') }}</span>
    </UiButton>
    <PluginCommentBoxComment
      v-if="!toggleComment"
      buttonName="Reply"
      :space="space"
      @dismissComment="toggleComment = true"
      @replyComment="allReply.push($event)"
      :item="item"
      :mainThread="item.key"
      method="replyComment"
      :placeholder="$t('comment_box.add_reply')"
    />
  </div>
  <PluginCommentBoxListReply
    :proposal="proposal"
    :profiles="profiles"
    :space="space"
    :allReply="allReply"
    :lastPage="lastPage"
    :mainThread="item.key"
    :loadingMore="loadingMore"
    @replyComment="allReply.push($event)"
    @updateItem="updateItemReply($event)"
    @deleteItem="deleteItemReply($event)"
    @loadMore="getReplyData"
  />
</template>
