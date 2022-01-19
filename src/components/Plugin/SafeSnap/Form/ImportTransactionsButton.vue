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
      json: '',
      error: '',
      open: false
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
        // const txs = json.map(this.importTx);
        // this.$emit('import', txs);
        console.log('json', json);
        this.json = JSON.stringify(json, null, '\t');
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

<template>
  <div class="root">
    <UiCollapsibleContent
      title="Add Transaction Batch with JSON"
      class="import-transactions"
      :hideRemove="true"
      :showArrow="true"
      :open="open"
      @toggle="open = !open"
      @remove="$emit('remove')"
    >
      <div style="padding: 8px 16px">
        <label for="files" class="mb-3 box file-import">
          Click to select file <br />
          or drag and drop
        </label>
        <input
          id="files"
          accept="application/json, text/plain"
          @change="importTxs"
          style="display: none"
          type="file"
        />
        <div class="box tx-content">
          <label for="tx_json"><h5>Transaction JSON</h5></label>
          <textarea
            id="tx_json"
            v-model="json"
            placeholder="You can also paste in JSON here."
            class="tx-textarea"
          ></textarea>
        </div>
      </div>
    </UiCollapsibleContent>
    <div v-if="error" class="error mb-3">Error: {{ error }}.</div>
  </div>
</template>

<style scoped>
.root {
  padding: 0 16px 16px 16px;
}
.import-transactions {
  border-radius: 23px;
}
.box {
  min-height: 100px;
  border-radius: 23px;
  border: 1px solid #cacaca;
}
.file-import {
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(244, 246, 246, 1);

  font-size: 16px;
  font-weight: 400;
}
.tx-content {
  padding: 16px 16px 0 16px;
}
.tx-textarea {
  width: 100%;
  padding: 0;
  min-height: 80px;
  font-size: 14px;
}
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
