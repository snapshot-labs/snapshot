<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton class="d-block width-full px-3 mb-3 height-full">
          <TextareaAutosize
            :disabled="loading"
            v-model="body"
            :placeholder="'Say something'"
            class="input width-full text-left"
          />
        </UiButton>
        <UiButton
          :loading="loading"
          @click="submit"
          class="button--submit width-full"
        >
          {{ $t('submit') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { send, signMessage } from '@/sign';

export default {
  setup() {
    const store = useStore();
    const auth = getInstance();

    const loading = ref(false);
    const body = ref('');
    const web3Account = computed(() => store.state.web3.account);

    async function submit() {
      loading.value = true;
      try {
        const envelop = await signMessage(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          type: 'post',
          payload: body.value
        });
        const result = await send(envelop);
        console.log('Result', result);
        console.log('Envelop', envelop);
        body.value = '';
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    }
    return { loading, body, submit };
  }
};
</script>
