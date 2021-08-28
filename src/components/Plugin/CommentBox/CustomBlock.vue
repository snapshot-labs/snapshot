<script setup>
import { ref, defineProps, defineEmits,onMounted } from 'vue';

const props = defineProps({
  modelValue: Number
});

const emit = defineEmits(['update:modelValue']);

const input = ref('');
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
onMounted(async () => {
  const apa=await getData(`https://uia5m1.deta.dev/all`);
  console.log(apa)
});
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', 
    body: JSON.stringify(data),
     headers: {"Content-type": "application/json;charset=UTF-8"}
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function sendComment(){
  await postData(`https://uia5m1.deta.dev/add`,{name:"sadaras",markdown:"dsad",reply:[]})
}

</script>
<template>
  <Block title="Comment Box">
    <UiButton
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
      <TextareaArray
        :placeholder="`Add your comment here`"
        class="input width-full text-left"
        style="font-size: 18px"
      />
    </UiButton>
    <div></div>
    <UiButton @click="sendComment" class="mt-2 button--submit"> Submit </UiButton>
    <UiButton class="ml-2 mt-2 button--primary"> Preview </UiButton>
    <Block :slim="true" class="p-4 d-block text-color mt-2">
      <div>
        <div class="mb-2">
          <Token :space="{ space: { id: 'thanku.eth' } }" size="23" />
          <span class="ml-2" v-text="`dsa`" />
          <UiDropdown class="float-right">
            <div>
              <UiLoading v-if="dropdownLoading" />
              <Icon
                v-else
                name="threedots"
                size="25"
                class="v-align-text-bottom"
              />
            </div>
          </UiDropdown>
        </div>
        <p v-text="`sadas`" class="break-word mb-1" style="font-size: 20px" />
        <div class="mt-1">adsad</div>
      </div>
    </Block>
  </Block>
</template>
