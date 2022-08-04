<script setup>
import { watch, computed, ref } from 'vue';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const { formatRelativeTime } = useIntl();
const { t } = useI18n();
const auth = getInstance();
const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();
const props = defineProps({
  item: Object,
  space: Object,
  profiles: Object,
  mainThread: String,
  proposal: Object
});
const emit = defineEmits([
  'deleteItem',
  'updateItem',
  'replyComment',
  'scrollTo'
]);
const toggleComment = ref(true);
const toggleEditComment = ref(true);
const loading = ref(false);
const threeDotItems = computed(() => {
  const items = [
    { text: t('comment_box.edit_button'), action: 'edit' },
    { text: t('comment_box.delete'), action: 'delete' }
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
    if (!web3Account.value) return (modalAccountOpen.value = true);
    closeModal.value = true;
  }
}
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
const { notify } = useFlashNotification();
async function deleteItem() {
  if (loading.value) return;
  try {
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
      `https://uia5m1.deta.dev/delete/`,
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
watch([closeModal], () => {
  const el = document.body;
  if (!closeModal.value) {
    el.classList['remove']('overflow-hidden');
  } else if (closeModal.value && !el.classList['contains']('overflow-hidden')) {
    el.classList['add']('overflow-hidden');
  }
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
</script>
<template>
  <BaseModal :open="closeModal" @close="closeModal = false">
    <template #header>
      <h3>{{ $t('comment_box.delete_comment') }}</h3>
    </template>
    <div class="mt-4 text-center">
      <p>{{ $t('comment_box.delete_modal') }}</p>
    </div>
    <div
      class="mb-2 mt-3 flex content-center items-center justify-center text-center"
    >
      <BaseButton
        :loading="loading"
        class="!bg-primary !text-white"
        @click="deleteItem"
        >{{ $t('comment_box.yes') }}</BaseButton
      >
      <BaseButton
        :disabled="loading"
        class="ml-2"
        @click="closeModal = false"
        >{{ $t('comment_box.no') }}</BaseButton
      >
    </div>
  </BaseModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :item="item"
      :space="space"
      :button-name="$t('comment_box.edit_button')"
      :placeholder="$t('comment_box.edit')"
      method="edit"
      @dismissComment="toggleEditComment = true"
      @updateItem="$emit('updateItem', $event)"
    />
  </div>
  <div v-if="toggleEditComment">
    <BaseBlock :slim="true" class="mt-2 mb-0 p-4 text-skin-text">
      <div>
        <BaseUser
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="inline-block"
        />
        <span
          v-tippy="{
            content: formatRelativeTime(item.timestamp / 1e3)
          }"
          class="ml-1"
          v-text="$d(item.timestamp, 'short', 'en-US')"
        />
        <BaseMenu
          v-if="isAdmin || isOwner || isCreator"
          class="float-right"
          :items="threeDotItems"
          @select="selectFromThreedotDropdown"
        >
          <template #button>
            <BaseIcon name="threedots" size="25" class="v-align-text-bottom" />
          </template>
        </BaseMenu>
      </div>
      <div class="mt-2">{{ item.markdown }}</div>
    </BaseBlock>
    <BaseButton
      class="rounded-0 mt-2 p-1"
      style="line-height: 0px; height: auto"
      @click="toggleComment = !toggleComment"
    >
      <BaseIcon :name="'receipt-outlined'" class="v-align-middle" size="15" />
      <span class="ml-1">{{ $t('comment_box.reply') }}</span>
    </BaseButton>
    <PluginCommentBoxComment
      v-if="!toggleComment"
      button-name="Reply"
      :space="space"
      :item="item"
      :main-thread="mainThread"
      method="replyComment"
      :placeholder="$t('comment_box.add_reply')"
      @dismissComment="toggleComment = true"
      @replyComment="$emit('replyComment', $event)"
      @updateItem="$emit('updateItem', $event)"
    />
  </div>
</template>
