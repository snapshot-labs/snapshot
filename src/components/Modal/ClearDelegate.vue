<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="d-flex">
    <template v-slot:header>
      <h3>{{ $t('removeDelegation') }}</h3>
    </template>
    <form @submit.prevent="handleSubmit" class="d-flex flex-column flex-auto">
      <h4 class="m-4 text-center">
        {{ $t('confirmRemove') }}
        <User :address="delegate" class="ml-1" />
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

<script>
import { mapActions } from 'vuex';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { formatBytes32String } from '@ethersproject/strings';
import { contractAddress } from '@/helpers/delegation';
import abi from '@/helpers/abi';
import { sleep } from '@/helpers/utils';

export default {
  props: ['open', 'id', 'delegate'],
  emits: ['close', 'reload'],
  data() {
    return {
      loading: false
    };
  },
  methods: {
    ...mapActions(['notify']),
    async handleSubmit() {
      this.loading = true;
      try {
        const tx = await sendTransaction(
          this.$auth.web3,
          contractAddress,
          abi['DelegateRegistry'],
          'clearDelegate',
          [formatBytes32String(this.id)]
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        await sleep(3e3);
        this.notify(this.$t('notify.youDidIt'));
        this.$emit('reload');
        this.$emit('close');
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  }
};
</script>
