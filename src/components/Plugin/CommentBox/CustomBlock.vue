<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { useWeb3 } from '@/composables/useWeb3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useRoute } from 'vue-router';
import { useProfiles } from '@/composables/useProfiles';
import { useNotifications } from '@/composables/useNotifications';
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

const emit = defineEmits(['update:modelValue']);
const loading = ref(false);
const comment = ref('');
const allData = ref([]);
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET' // *GET, POST, PUT, DELETE, etc.
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function getCommentData() {
  const res = await getData(`https://uia5m1.deta.dev/all/${props.proposalId}`);
  if (res.status) allData.value = res.data.items;
}
onMounted(async () => {
  getCommentData();
});
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
  try {
    loading.value = true;
    const res = await postData(`https://uia5m1.deta.dev/add`, {
      author: web3Account.value,
      markdown: comment.value,
      reply: [],
      proposal_id: props.proposalId,
      timestamp:new Date().getTime()
    });
    comment.value = '';
    loading.value = false;
    await getCommentData();
    if (!res.status) notify(['red', 'Oops, something went wrong']);
    return;
  } catch (e) {
    loading.value = false;
    notify(['red', 'Oops, something went wrong']);
  }
}
const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(key);

function clickSubmit() {
  !web3Account.value
    ? (modalAccountOpen.value = true)
    : !termsAccepted.value && space.value.terms
    ? (modalTermsOpen.value = true)
    : handleSubmit();
}
</script>
<template>
  <Block title="Comment Box">
    <UiButton
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

    <UiButton
      @click="clickSubmit"
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
    >
      Submit
    </UiButton>
    <UiButton class="ml-2 mt-2 button--primary"> Preview </UiButton>
    {{ allData.value }}
    <Block
      :slim="true"
      class="p-4 text-color mt-2"
      :key="index"
      v-for="(item, index) in allData"
    >
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block"
        />
        <UiDropdown class="float-right">
          <div>
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
      <p
        v-text="item.markdown"
        class="break-word mb-1"
        style="font-size: 20px"
      />
      <div class="mt-1">{{item.timestamp}}</div>
    </Block>
  </Block>
</template>
