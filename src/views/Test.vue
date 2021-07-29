<script setup>
import { ref } from 'vue';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

const auth = getInstance();
const content = ref('');

const abi = ['function post(string memory content) public'];
const address = '0xA0c7A49916Ce3ed7dd15871550212fcc7079AD61';

async function handleSubmit() {
  console.log('Submit!');

  try {
    const tx = await sendTransaction(auth.web3, address, abi, 'post', [
      content.value
    ]);
    const receipt = await tx.wait();
    console.log('Receipt', receipt);
    alert('OK!');
  } catch (e) {
    console.log(e);
  }
}
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3 d-flex">
        <h2>Poster</h2>
      </div>
      <Block>
        <UiButton
          class="d-block width-full mb-2 overflow-x-auto text-left"
          style="height: auto"
        >
          <TextareaAutosize
            v-model="content"
            class="input width-full"
            placeholder="Say something"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          class="d-block width-full button--submit"
        >
          Post
        </UiButton>
      </Block>
    </template>
  </Layout>
</template>
