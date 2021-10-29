<script setup>
import { ref, watchEffect, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUsername } from '@/composables/useUsername';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { formatBytes32String } from '@ethersproject/strings';
import { contractAddress } from '@/helpers/delegation';
import { sleep } from '@/helpers/utils';
import { useTxStatus } from '@/composables/useTxStatus';

const props = defineProps({
  open: Boolean,
  id: String,
  delegate: String,
  profiles: Object
});

const abi = ['function clearDelegate(bytes32 id)'];

const emit = defineEmits(['close', 'reload']);

const auth = getInstance();
const { t } = useI18n();
const { address, profile, username } = useUsername();
const notify = inject('notify');

const loading = ref(false);
const { pendingCount } = useTxStatus();

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
    pendingCount.value++;
    emit('close');
    loading.value = false;
    const receipt = await tx.wait();
    console.log('Receipt', receipt);
    await sleep(3e3);
    notify(t('notify.delegationRemoved'));
    pendingCount.value--;
    emit('reload');
  } catch (e) {
    pendingCount.value--;
    console.log(e);
  }
  loading.value = false;
}
</script>

<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="flex">
    <template v-slot:header>
      <h3>{{ $t('removeDelegation') }}</h3>
    </template>
    <form @submit.prevent="handleSubmit" class="flex flex-col flex-auto">
      <h4 class="m-4 text-center">
        {{ $t('confirmRemove') }}
        {{ username }}
        <template v-if="id">{{ $tc('removeSpace', [id]) }}</template
        >?
      </h4>
      <div class="p-4 overflow-hidden text-center border-t">
        <div class="w-2/4 float-left pr-2">
          <UiButton @click="$emit('close')" type="button" class="w-full">
            {{ $t('cancel') }}
          </UiButton>
        </div>
        <div class="w-2/4 float-left pl-2">
          <UiButton
            :disabled="loading"
            :loading="loading"
            type="submit"
            class="w-full"
            primary
          >
            {{ $t('confirm') }}
          </UiButton>
        </div>
      </div>
    </form>
  </UiModal>
</template>
