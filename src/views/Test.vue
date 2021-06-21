<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton
          :loading="loading"
          @click="submit"
          class="button--submit width-full"
        >
          {{ $t('proposal.vote') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { send, vote } from '@/sign';

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
        const envelop = await vote(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          timestamp: 1624139921,
          proposal:
            '0x71618aeb1a793d6af3c8e33e895a945623ba58cfb02f10119dc29263cb242572',
          choice: 1,
          metadata: JSON.stringify({})
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
