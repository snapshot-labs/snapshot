<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  address: string;
}>();

const email = ref(null);

async function subscribe() {
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
    console.log('OK');
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
        <i-ho-paper-airplane class="rotate-90 text-skin-link" />
      </button>
    </InputEmail>
  </form>
</template>
