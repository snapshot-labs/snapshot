<template>
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
</template>

<script>
import { mapActions } from 'vuex';
import { formatEther } from '@ethersproject/units';
export default {
  props: ['transaction'],
  methods: {
    ...mapActions(['notify']),
    formatAmount(amount, maxDecimals) {
      let out = formatEther(amount);
      if (maxDecimals && out.includes('.')) {
        const parts = out.split('.');
        if (parts[1].length > maxDecimals) {
          out = '~' + parts[0] + '.' + parts[1].slice(0, maxDecimals);
        }
      }
      return out + ' ETH';
    },
    handleCopy() {
      this.notify('Copied!');
    }
  }
};
</script>
