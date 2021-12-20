<script>
import { ETHEREUM_COIN } from '@/helpers/abi/utils';
import { parseEther } from '@ethersproject/units';
import { isAddress } from '@ethersproject/address';
import { FunctionFragment, Interface } from '@ethersproject/abi';

export default {
  name: 'ImportTransactionsButton',
  emits: ['import'],
  data() {
    return {
      error: ''
    };
  },
  methods: {
    async importTxs(event) {
      const json = await this.readFile(event);
      this.error = '';
      if (!Array.isArray(json)) {
        this.error = 'JSON must be an array';
        return;
      }
      try {
        const txs = json.map(this.importTx);
        this.$emit('import', txs);
      } catch (err) {
        console.log('err', err);
        this.error = err.message;
      }
    },
    importTx(tx, index) {
      if (tx.to && tx.value && isAddress(tx.to)) {
        const value = parseEther(tx.value).toString();
        const base = {
          to: tx.to,
          value,
          nonce: index,
          operation: tx.operation || '0'
        };

        if (tx.method && tx.params) {
          const method = FunctionFragment.from(tx.method);
          const contractInterface = new Interface([method]);
          try {
            const data = contractInterface.encodeFunctionData(
              method,
              tx.params
            );
            return {
              type: 'contractInteraction',
              data,
              abi: contractInterface.fragments.map(frag => frag.format('full')),
              ...base
            };
          } catch (err) {
            throw new Error(
              'invalid function params for transaction #' + (index + 1)
            );
          }
        }

        return {
          type: 'transferFunds',
          data: '0x',
          token: ETHEREUM_COIN,
          recipient: tx.to,
          amount: value,
          ...base
        };
      }
      throw new Error(`transaction #${index + 1} is invalid`);
    },
    readFile(event) {
      return new Promise((resolve, reject) => {
        const [file] = event.target?.files || [];
        if (file) {
          const reader = new FileReader();
          reader.addEventListener('load', e => {
            event.target.value = '';
            try {
              resolve(JSON.parse(e.target.result));
            } catch (e) {
              reject(new Error('JSON is not valid'));
            }
          });
          reader.addEventListener('error', reject);
          reader.addEventListener('abort', reject);
          reader.readAsBinaryString(file);
        }
      });
    }
  }
};
</script>
<style scoped>
.error {
  display: inline-block;
  background: rgba(255, 0, 0, 0.1);
  color: rgba(255, 48, 48, 1);
  border-radius: 24px;
  padding: 16px;
  font-size: 14px;
  font-weight: 100;
}
</style>

<template>
  <label for="files" class="mb-3 block underline">
    or Upload Transaction JSON
  </label>
  <input
    id="files"
    accept="application/json, text/plain"
    @change="importTxs"
    style="display: none"
    type="file"
  />
  <div v-if="error" class="error mb-3">Error: {{ error }}.</div>
</template>
