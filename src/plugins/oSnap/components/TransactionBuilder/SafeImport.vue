<script setup lang="ts">
import { parseAmount } from '@/helpers/utils';
import { isAddress, FunctionFragment } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { SafeImportTransaction, GnosisSafe } from '../../types';
import { createSafeImportTransaction, parseValueInput, isSafeFile, getABIWriteFunctions } from '../../utils';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  transaction: SafeImportTransaction | undefined;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

const file = ref(null);
const safeTransactions:null | GnosisSafe.BatchFile = ref(null);
const selectedTransactionIndex: null | number = ref(null);


const importFile = async (file: File): Promise<BatchFile> => {
  return new Promise((res,rej) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = async () => {
      try{
        const json = JSON.parse(
          reader.result,
        )
        if(isSafeFile(json)){
          return res(json)
        }
        throw new Error('Not a Gnosis Safe transaction file!')
      }catch(err){
        rej(err)
      }
    }
  })
}

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
  if(!file.value) return;
  importFile(file.value).then(result=>{
    safeTransactions.value = result
    console.log(safeTransactions.value)
  }).catch(console.error)

};

function updateTransaction(partialTx:PartialSafeImportTransaction) {
  try {
//  if (!isToValid.value) {
//    throw new Error('"To" address invalid');
//  }
//  if (!isValueValid.value) {
//    throw new Error('"Value" amount invalid invalid');
//  }
//  if (!isDataValid.value) {
//    throw new Error('"Data" field invalid');
//  }

    const tx = createSafeImportTransaction(partialTx)
    console.log(tx)
    emit('updateTransaction', tx);
  } catch (error) {
    console.error(error);
    props.setTransactionAsInvalid();
  }
}


// need a way to select which transaction we want toimport
watch(selectedTransactionIndex, (index=>{
  console.log({index},safeTransactions.value)
  if(index >= 0){
    const convertedTxs = convertSafeTransactions(safeTransactions.value)
    console.log(convertedTxs[index])
    updateTransaction(convertedTxs[index])
  }
}));


type PartialSafeImportTransaction = Omit<SafeImportTransaction | 'formatted'>
function convertSafeTransactions(txs?:GnosisSafe.BatchFile):PartialSafeImportTransaction[] {
  if(!txs) return  []
  return txs.transactions.map(safeTx=>{
    return {
      methodName:safeTx.contractMethod?.name,
      parameters:safeTx.contractMethod?.inputs?.map(({name,type})=>({
        name,
        type,
        value:safeTx.contractInputsValues?.[name] 
      })),
      to:safeTx.to,
      value: safeTx.value,
      data: safeTx.data,
    }
  })
}
const objectFromEntriesSorted = (obj: Object) => {
  // set as array first to the correct preserve order
  let entries = Object.entries(obj);
  let sorted: Array<[string, any]> = [];

  keyOrder.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      sorted.push([key, obj[key]]);
      entries = entries.filter(item => item[0] !== key);
    }
  });
  // ensure we don't filter out any items we didn't explicitly sort
  return [...sorted, ...entries];
};

</script>

<template>
  <div class="space-y-2">
    <input type="file" @change="handleFileUpload($event)" />
    <div v-if="file">
      Selected file: {{ file.name }}
    </div>
  </div>
  <div
      v-if="safeTransactions?.transactions.length > 0"
    class="flex w-full flex-col gap-4 rounded-2xl border border-skin-border p-3 md:p-4 relative"
  >
    <UiSelect v-model="selectedTransactionIndex">
      <template #label>Select Transaction</template>
      <option v-for="(tx,i) in safeTransactions?.transactions" :key="i" :value="i">
        {{i+1}}. {{ tx.contractMethod.name }}
      </option>
    </UiSelect>
  </div>
  <div
    v-if="props?.transaction?.parameters.length"
    class="flex w-full flex-col gap-4 rounded-2xl border border-skin-border p-3 md:p-4 relative"
  >
    <ReadOnly v-for="param in props.transaction.parameters">
      <strong
        class="mr-2 inline-block whitespace-nowrap first-letter:capitalize"
        >{{ param.name }} ({{param.type}})</strong
      >
      <span class="break-all">{{ param.value }}</span>
    </ReadOnly>
  </div>
</template>
