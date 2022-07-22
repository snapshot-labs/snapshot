<script>
import { getNativeAsset } from '../../index';
import { parseEther } from '@ethersproject/units';
import { isAddress } from '@ethersproject/address';
import { FunctionFragment, Interface } from '@ethersproject/abi';

export default {
  name: 'ImportTransactionsButton',
  props: ['network'],
  emits: ['import', 'remove'],
  data() {
    return {
      json: '',
      error: '',
      open: false,
      dropping: false
    };
  },
  methods: {
    async handleFileUpload(event) {
      const [file] = event.target?.files || [];
      if (!file) {
        this.error = 'Uploading file';
        return;
      }
      event.target.value = '';
      return this.importFromFile(file);
    },
    async importFromFile(file) {
      let json;
      try {
        json = await this.readFile(file);
      } catch (err) {
        console.warn('err', err);
        this.error = 'Uploading file';
        return;
      }
      this.importTxs(json);
    },
    importFromText() {
      let json;
      try {
        json = JSON.parse(this.json);
      } catch (err) {
        console.warn('err', err);
        this.error = 'JSON is not valid';
        return;
      }
      const successful = this.importTxs(json);
      if (successful) {
        // Clear textarea
        this.json = '';
      }
    },
    importTxs(json) {
      this.error = '';
      if (!Array.isArray(json)) {
        this.error = 'JSON must be an array';
        return false;
      }
      try {
        const txs = json.map(this.importTx);
        this.$emit('import', txs);
        return true;
      } catch (err) {
        console.warn('err', err);
        this.error = err.message;
        return false;
      }
    },
    toggleDropping() {
      this.dropping = !this.dropping;
    },
    drop(event) {
      this.toggleDropping();
      const file = event.dataTransfer.files[0];
      this.importFromFile(file);
    },
    importTx(tx, index) {
      if (tx.to && tx.value && isAddress(tx.to)) {
        let value, data;
        try {
          value = parseEther(tx.value).toString();
          data = tx.data?.toString().trim();
        } catch (err) {
          throw new Error(`transaction #${index + 1} is invalid`);
        }
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
        } else if (data && data !== '0x') {
          return {
            type: 'raw',
            data,
            ...base
          };
        }

        return {
          type: 'transferFunds',
          data: '0x',
          token: getNativeAsset(this.network),
          recipient: tx.to,
          amount: value,
          ...base
        };
      }
      throw new Error(`transaction #${index + 1} is invalid`);
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', e => {
          try {
            resolve(JSON.parse(e.target.result));
          } catch (e) {
            reject(new Error('JSON is not valid'));
          }
        });
        reader.addEventListener('error', reject);
        reader.addEventListener('abort', reject);
        reader.readAsBinaryString(file);
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
      :hide-remove="true"
      :show-arrow="true"
      :open="open"
      @toggle="open = !open"
      @remove="$emit('remove')"
    >
      <div style="padding: 8px 16px">
        <label
          for="files"
          :class="{
            box: true,
            'file-import': true,
            'active-dropzone': dropping
          }"
          class="box file-import"
          @dragenter.prevent="toggleDropping"
          @dragleave.prevent="toggleDropping"
          @drop.prevent="drop"
          @dragover.prevent
        >
          Click to select file <br />
          or drag and drop
        </label>
        <input
          id="files"
          ref="files"
          accept="application/json, text/plain"
          style="display: none"
          type="file"
          @change="handleFileUpload"
        />
        <div v-if="error" class="error mt-3">Error: {{ error }}.</div>
        <div class="box tx-content mt-3">
          <label for="tx_json"><h5>Transaction JSON</h5></label>
          <textarea
            id="tx_json"
            v-model="json"
            placeholder="You can also paste in JSON here."
            class="tx-textarea outline-none"
          ></textarea>
        </div>
        <div class="mt-3 flex flex-col items-center justify-center">
          <BaseButton @click="importFromText">Parse JSON</BaseButton>
          <a
            class="mt-2 mb-1"
            style="text-decoration: underline; font-size: 14px"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/gnosis/safe-tasks/blob/c9c52f76d16d43b0682950f3411ef283871acb5f/tx_input.sample.json"
          >
            Transaction JSON example
          </a>
        </div>
      </div>
    </UiCollapsibleContent>
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
  background-color: rgba(244, 246, 246, 0.3);
  cursor: pointer;

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
  background: transparent;
}
.error {
  background: rgba(255, 0, 0, 0.1);
  color: rgba(255, 48, 48, 1);
  border-radius: 24px;
  padding: 16px;
  font-size: 14px;
  font-weight: 100;
}
.active-dropzone {
  background: green;
}
</style>
