<script setup>
import { ref, toRef, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useNotifications } from '@/composables/useNotifications';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const auth = getInstance();
const { modalOpen, modalAccountOpen } = useModal();
const props = defineProps({
  placeholder: String,
  buttonName: String,
  item: Object,
  method: String,
  mainThread: String,
  space: Object
});
const { web3Account } = useWeb3();
const item2 = toRef(props, 'item');
const comment = ref(
  props.method === 'edit' && item2.value?.markdown
    ? clone(item2.value?.markdown)
    : ''
);
const loading = ref(false);
const togglePreview = ref(true);
const closeModal = ref(false);
const emit = defineEmits(['dismissComment', 'updateItem', 'replyComment']);
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
const { notify } = useNotifications();
async function updateItems() {
  if (loading.value) return;
  try {
    loading.value = true;
    const token = localStorage.getItem('_commentBox.token');
    let sig;
    const msg = { markdown: comment.value };
    if (!token)
      sig = await signMessage(
        auth.web3,
        JSON.stringify(msg),
        web3Account.value
      );
    const res = await postData(
      `https://uia5m1.deta.dev/update/${props.item.key}`,
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
    emit('updateItem', res.data);
    emit('dismissComment');
    closeModal.value = false;

    return;
  } catch (e) {
    if (e.message === 'refresh') {
      localStorage.removeItem('_commentBox.token');
      updateItems();
      return;
    }
    loading.value = false;
    notify(['primary', t('comment_box.error')]);
  }
}
const chooseMethod = {
  edit: () => {
    if (!web3Account.value) return (modalAccountOpen.value = true);
    closeModal.value = true;
  },
  replyComment: async function replyComment() {
    if (!web3Account.value) return (modalAccountOpen.value = true);
    if (loading.value) return;
    try {
      loading.value = true;
      const token = localStorage.getItem('_commentBox.token');
      let sig;
      const msg = {
        author: web3Account.value,
        markdown: comment.value,
        proposal_id: props.item.proposal_id,
        main_thread_id: props.mainThread,
        reply_to: props.item.author,
        reply_thread_id: props.item.key,
        reply: props.item.markdown
      };
      if (!token)
        sig = await signMessage(
          auth.web3,
          JSON.stringify(msg),
          web3Account.value
        );
      const res = await postData(
        `https://uia5m1.deta.dev/add_reply`,
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
      if (res.token) localStorage.setItem('_commentBox.token', res.token);
      emit('dismissComment');
      emit('replyComment', res.data);
      return;
    } catch (e) {
      if (e.message === 'refresh') {
        localStorage.removeItem('_commentBox.token');
        replyComment();
        return;
      }
      loading.value = false;
      notify(['primary', t('comment_box.error')]);
    }
  }
};
function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
}
watch([modalOpen, closeModal], () => {
  const el = document.body;
  if (!closeModal.value) {
    el.classList['remove']('overflow-hidden');
  } else if (closeModal.value && !el.classList['contains']('overflow-hidden')) {
    el.classList['add']('overflow-hidden');
  }
});
</script>
<template>
  <UiModal :open="closeModal" @close="closeEvent">
    <template v-slot:header>
      <h3>{{ $t('comment_box.edit_comment') }}</h3>
    </template>
    <div class="text-center mt-3">
      <p>{{ $t('comment_box.edit_modal') }}</p>
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
        class="!bg-primary !text-white"
        :loading="loading"
        @click="updateItems"
        >{{ $t('comment_box.yes') }}</UiButton
      >
      <UiButton @click="closeEvent" :disabled="loading" class="ml-2">{{
        $t('comment_box.no')
      }}</UiButton>
    </div>
  </UiModal>
  <div class="mt-2">
    <UiButton
      v-if="togglePreview"
      class="flex w-full px-3 !h-auto cursor-default"
    >
      <TextareaAutosize
        v-model="comment"
        :placeholder="placeholder"
        class="input w-full text-left"
        :minHeight="100"
        style="font-size: 18px"
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
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2"
      @click="chooseMethod[method]"
      primary
    >
      {{ buttonName }}
    </UiButton>
    <UiButton
      @click="togglePreview = !togglePreview"
      :disabled="comment.length === 0"
      class="ml-2 mt-2"
      primary
    >
      {{
        togglePreview
          ? $t('comment_box.preview')
          : $t('comment_box.continue_editing')
      }}
    </UiButton>
    <UiButton
      :disabled="loading"
      @click="$emit('dismissComment')"
      type="text"
      class="border-0 ml-2 mt-2 button--text"
    >
      {{ $t('comment_box.dismiss') }}
    </UiButton>
  </div>
</template>
