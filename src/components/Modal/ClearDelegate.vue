<template>
  <UiModal :open="open" v-if="open" @close="$emit('close')" class="d-flex">
    <form @submit.prevent="handleSubmit" class="d-flex flex-column flex-auto">
      <h3 class="m-4 mb-0 text-center">Remove delegation</h3>
      <h4 class="m-4 text-center">
        Are you sure you want to remove your delegation to
        <User :address="delegate" class="ml-1" />
        <template v-if="id">for the space "{{ id }}"</template>?
      </h4>
      <div class="p-4 overflow-hidden text-center border-top">
        <div class="col-6 float-left pr-2">
          <UiButton @click="$emit('close')" type="button" class="width-full">
            Cancel
          </UiButton>
        </div>
        <div class="col-6 float-left pl-2">
          <UiButton
            :disabled="loading"
            :loading="loading"
            type="submit"
            class="width-full button--submit"
          >
            Confirm
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
        this.notify('You did it!');
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
