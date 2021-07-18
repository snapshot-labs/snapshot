<script>
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useUsername } from '@/composables/useUsername';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { formatBytes32String } from '@ethersproject/strings';
import { contractAddress } from '@/helpers/delegation';
import { sleep } from '@/helpers/utils';

const abi = ['function clearDelegate(bytes32 id)'];

export default {
  props: { open: Boolean, id: String, delegate: String, profiles: Object },
  emits: ['close', 'reload'],
  setup(props, { emit }) {
    const store = useStore();
    const auth = getInstance();
    const { t } = useI18n();

    const loading = ref(false);

    const { address, profile, username } = useUsername();

    watchEffect(() => {
      address.value = props.delegate;
      profile.value = props.profiles[props.delegate];
    });

    async function handleSubmit() {
      loading.value = true;
      try {
        const tx = await sendTransaction(
          auth.web3,
          contractAddress,
          abi,
          'clearDelegate',
          [formatBytes32String(props.id)]
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        await sleep(3e3);
        store.dispatch('notify', t('notify.youDidIt'));
        emit('reload');
        emit('close');
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    }

    return { loading, handleSubmit, username };
  }
};
</script>

<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="d-flex">
    <template v-slot:header>
      <h3>{{ $t('removeDelegation') }}</h3>
    </template>
    <form @submit.prevent="handleSubmit" class="d-flex flex-column flex-auto">
      <h4 class="m-4 text-center">
        {{ $t('confirmRemove') }}
        {{ username }}
        <template v-if="id">{{ $tc('removeSpace', [id]) }}</template
        >?
      </h4>
      <div class="p-4 overflow-hidden text-center border-top">
        <div class="col-6 float-left pr-2">
          <UiButton @click="$emit('close')" type="button" class="width-full">
            {{ $t('cancel') }}
          </UiButton>
        </div>
        <div class="col-6 float-left pl-2">
          <UiButton
            :disabled="loading"
            :loading="loading"
            type="submit"
            class="width-full button--submit"
          >
            {{ $t('confirm') }}
          </UiButton>
        </div>
      </div>
    </form>
  </UiModal>
</template>
