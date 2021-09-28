<script setup>
import { defineProps, watch, computed, ref, defineEmits } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const auth = getInstance();
const { modalOpen, modalAccountOpen } = useModal();
const { web3 } = useWeb3();
const web3Account = computed(() => web3.value.account);
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
const { notify } = useNotifications();
async function deleteItem() {
  if (loading.value) return;
  try {
    loading.value = true;
    const token = localStorage.getItem('_commentBox.token');
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
    if (res.token) localStorage.setItem('_commentBox.token', res.token);
    emit('deleteItem', props.item.key);
    closeModal.value = false;

    return;
  } catch (e) {
    if (e.message === 'refresh') {
      localStorage.removeItem('_commentBox.token');
      deleteItem();
      return;
    }
    loading.value = false;
    notify(['primary', t('comment_box.error')]);
  }
}
watch([modalOpen, closeModal], () => {
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
  <UiModal :open="closeModal" @close="closeModal = false">
    <template v-slot:header>
      <h3>{{ $t('comment_box.delete_comment') }}</h3>
    </template>
    <div class="text-center mt-4">
      <p>{{ $t('comment_box.delete_modal') }}</p>
    </div>
    <div
      class="
        mb-2
        mt-3
        text-center
        flex
        items-center
        content-center
        justify-center
      "
    >
      <UiButton
        @click="deleteItem"
        :loading="loading"
        class="!bg-primary !text-white"
        >{{ $t('comment_box.yes') }}</UiButton
      >
      <UiButton :disabled="loading" @click="closeModal = false" class="ml-2">{{
        $t('comment_box.no')
      }}</UiButton>
    </div>
  </UiModal>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      :item="item"
      :space="space"
      :buttonName="$t('comment_box.edit_button')"
      :placeholder="$t('comment_box.edit')"
      @dismissComment="toggleEditComment = true"
      @updateItem="$emit('updateItem', $event)"
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
        />
        <span
          v-text="$d(item.timestamp, 'short', 'en-US')"
          v-tippy="{
            content: _ms(item.timestamp / 1e3)
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
      @replyComment="$emit('replyComment', $event)"
      @updateItem="$emit('updateItem', $event)"
      :item="item"
      :mainThread="mainThread"
      method="replyComment"
      :placeholder="$t('comment_box.add_reply')"
    />
  </div>
</template>
