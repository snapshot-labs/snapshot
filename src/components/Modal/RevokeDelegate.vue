<script setup>
import { ref, watchEffect, inject } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useUsername } from '@/composables/useUsername';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction, sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { formatBytes32String } from '@ethersproject/strings';
import { contractAddress } from '@/helpers/delegation';
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
const { username, setProfile, setAddress } = useUsername();
const notify = inject('notify');

const loading = ref(false);
const { pendingCount } = useTxStatus();

watchEffect(() => {
  setProfile(props.profiles[props.delegate]);
  setAddress(props.delegate);
});

async function handleSubmit() {
  loading.value = true;
  try {
    const tx = await sendTransaction(
      auth.web3,
      contractAddress,
      abi,
      'clearDelegate',
      [formatBytes32String(props.id || '')]
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
  <BaseModal :open="open" v-if="open" @close="$emit('close')" class="flex">
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
          <BaseButton @click="$emit('close')" type="button" class="w-full">
            {{ $t('cancel') }}
          </BaseButton>
        </div>
        <div class="w-2/4 float-left pl-2">
          <BaseButton
            :disabled="loading"
            :loading="loading"
            type="submit"
            class="w-full"
            primary
          >
            {{ $t('confirm') }}
          </BaseButton>
        </div>
      </div>
    </form>
  </BaseModal>
</template>
