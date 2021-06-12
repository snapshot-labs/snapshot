<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0">
        <h1 v-text="'Test'" class="mb-4" />
      </div>
      <Block>
        <UiButton class="d-block width-full px-3 mb-3" style="height: auto">
          <TextareaAutosize v-model="body" class="input width-full text-left" />
        </UiButton>
        <UiButton @click="submit" class="button--submit width-full">
          {{ $t('submit') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { send, signMessage } from '@/sign';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export default {
  setup() {
    const store = useStore();
    const auth = getInstance();

    const body = ref('');
    const web3Account = computed(() => store.state.web3.account);

    async function submit() {
      try {
        const envelop = await signMessage(auth.web3, web3Account.value, {
          space: 'fabien.eth',
          type: 'post',
          payload: body.value
        });
        const result = await send(envelop);
        console.log('Result', result);
        console.log('Envelop', envelop);
      } catch (e) {
        console.log(e);
      }
    }
    return { body, submit };
  }
};
</script>
