<script setup lang="ts">
import { parseEther } from '@ethersproject/units';
import { isAddress } from '@ethersproject/address';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { getNativeAsset } from '@/plugins/safeSnap/utils/coins';
import { SafeTransactionOperationType } from '@/plugins/safeSnap/interfaces';
import { ref } from 'vue';

const props = defineProps(['network']);
const emit = defineEmits(['import', 'remove']);

const jsonString = ref('');
const error = ref('');
const open = ref(false);
const dropping = ref(false);

const readFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', e => {
      try {
        resolve(JSON.parse(e.target?.result as string));
      } catch {
        reject(new Error('JSON is not valid'));
      }
    });
    reader.addEventListener('error', reject);
    reader.addEventListener('abort', reject);
    reader.readAsBinaryString(file);
  });
};

const importTx = (tx, index) => {
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
      operation: tx.operation || SafeTransactionOperationType.CALL
    };

    if (tx.method && tx.params) {
      const method = FunctionFragment.from(tx.method);
      const contractInterface = new Interface([method]);
      try {
        const encodedData = contractInterface.encodeFunctionData(
          method,
          tx.params
        );
        return {
          type: 'contractInteraction',
          data: encodedData,
          abi: contractInterface.fragments.map(frag => frag.format('full')),
          ...base
        };
      } catch (err) {
        throw new Error(
          `invalid function params for transaction #${index + 1}`
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
      token: getNativeAsset(props.network),
      recipient: tx.to,
      amount: value,
      ...base
    };
  }
  throw new Error(`transaction #${index + 1} is invalid`);
};

const importTxs = json => {
  error.value = '';
  if (!Array.isArray(json)) {
    error.value = 'JSON must be an array';
    return false;
  }
  try {
    const txs = json.map(importTx);
    emit('import', txs);
    return true;
  } catch (err: Error) {
    console.warn('err', err);
    error.value = err.message;
    return false;
  }
};

const importFromFile = async file => {
  let json;
  try {
    json = await readFile(file);
  } catch (err) {
    console.warn('err', err);
    error.value = 'Uploading file';
    return;
  }
  importTxs(json);
};

const handleFileUpload = async event => {
  const [file] = event.target?.files || [];
  if (!file) {
    error.value = 'Uploading file';
    return;
  }
  event.target.value = '';
  return importFromFile(file);
};

const importFromText = () => {
  let json;
  try {
    json = JSON.parse(jsonString.value);
  } catch (err) {
    console.warn('err', err);
    error.value = 'JSON is not valid';
    return;
  }
  const successful = importTxs(json);
  if (successful) {
    // Clear textarea
    jsonString.value = '';
  }
};

const toggleDropping = () => {
  dropping.value = !dropping.value;
};

const drop = event => {
  toggleDropping();
  const file = event.dataTransfer.files[0];
  importFromFile(file);
};
</script>

<template>
  <div class="mx-3 mb-3">
    <UiCollapsibleContent
      title="Add Transaction Batch with JSON"
      class="rounded-3xl"
      :hide-remove="true"
      :show-arrow="true"
      :open="open"
      @toggle="open = !open"
      @remove="$emit('remove')"
    >
      <div style="padding: 8px 16px">
        <label
          for="files"
          :class="{ '!bg-green': dropping }"
          class="flex min-h-[100px] cursor-pointer items-center justify-center rounded-3xl border"
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
        <div v-if="error" class="mt-3 rounded-3xl bg-red p-3 text-white">
          Error: {{ error }}.
        </div>
        <div class="mt-3 min-h-[100px] rounded-3xl border px-3 pt-3">
          <label for="tx_json"><h5>Transaction JSON</h5></label>
          <textarea
            id="tx_json"
            v-model="jsonString"
            placeholder="You can also paste in JSON here."
            class="min-h-[80px] w-full text-sm outline-none"
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
