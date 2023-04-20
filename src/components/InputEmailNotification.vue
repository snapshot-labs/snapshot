<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  address: string;
}>();

const email = ref('');
const modalOpen = ref(false);
const modalLevel = ref('info');
const modalMessage = ref('');
const loading = ref(false);

async function subscribe() {
  loading.value = true;

  try {
    const response = await fetch('https://envelop.fyi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: {
          email: email.value,
          address: props.address
        },
        method: 'snapshot.subscribe'
      })
    });

    const result = await response.json();

    if (result.result === 'OK') {
      modalLevel.value = 'info';
      modalMessage.value =
        'You have been subscribed to email notifications. You will receive an email shortly with a verification link in order to confirm your subscription.';
    } else {
      modalLevel.value = 'warning';
      modalMessage.value =
        'An error occured while adding your email to the subscriptions list';
    }
  } catch (e) {
    modalLevel.value = 'warning';
    modalMessage.value =
      'Unable to subscribe to email notifications, please try again later';
  } finally {
    loading.value = false;
    modalOpen.value = true;
  }
}
</script>

<template>
  <form class="flex" @submit.prevent="subscribe">
    <InputEmail v-model="email" name="email" autocomplete="off" required>
      <button
        type="submit"
        class="absolute right-0 h-[42px] rounded-r-full px-3"
      >
        <LoadingSpinner v-if="loading" />
        <i-ho-paper-airplane v-else class="rotate-90 text-skin-link" />
      </button>
    </InputEmail>
  </form>
  <ModalMessage
    :open="modalOpen"
    :level="modalLevel"
    :message="modalMessage"
    title="Email notifications"
    @close="modalOpen = false"
  />
</template>
