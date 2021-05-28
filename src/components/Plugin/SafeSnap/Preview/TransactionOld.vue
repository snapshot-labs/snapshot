<template>
  <div class="mb-3 p-4 border rounded-2 text-white text-center">
    <b
      v-text="`${transaction.operation === '0' ? 'Call' : 'Delegate Call'} to`"
    /><br />
    <span>
      <jazzicon
        :address="transaction.to"
        :diameter="22"
        class="d-inline-block v-align-middle line-height-0"
      />
      &nbsp;<b v-text="_shorten(transaction.to)" />&nbsp;
      <Icon
        v-clipboard:copy="transaction.to"
        v-clipboard:success="handleCopy"
        name="copy"
        size="24"
        class="text-gray p-2 mr-n3"
      />
      <br />
    </span>
    with<br />
    <span
      class="mr-1 tooltipped tooltipped-multiline tooltipped-n break-word"
      :aria-label="formatAmount(transaction.value)"
    >
      {{ formatAmount(transaction.value, 5) }}
    </span>
    <br />
    <span v-if="transaction.data">
      and<br />
      <span
        class="mr-1 tooltipped tooltipped-multiline tooltipped-n break-word"
        :aria-label="transaction.data"
      >
        {{ _shorten(transaction.data, 10) }}
      </span>
      <Icon
        v-clipboard:copy="transaction.data"
        v-clipboard:success="handleCopy"
        name="copy"
        size="24"
        class="text-gray p-2 mr-n3"
      />
    </span>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { formatAmount } from '@/helpers/utils';

export default {
  props: ['transaction'],
  methods: {
    ...mapActions(['notify']),
    formatAmount,
    handleCopy() {
      this.notify('Copied!');
    }
  }
};
</script>
