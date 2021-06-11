<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton @click="submit" class="button--submit width-full">
          {{ $t('submit') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { send, signMessage } from '@/sign';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export default {
  setup() {
    const store = useStore();
    const web3Account = computed(() => store.state.web3.account);
    const auth = getInstance();

    async function submit() {
      try {
        const envelop = await signMessage(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          type: 'post',
          payload: 'Hi!'
        });
        const result = await send(envelop);
        console.log('Result', result);
        console.log('Envelop', envelop);
      } catch (e) {
        console.log(e);
      }
    }
    return { submit };
  }
};
</script>
