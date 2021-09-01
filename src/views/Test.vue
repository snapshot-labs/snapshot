<script setup>
import { ref, watch } from 'vue';
// import schema from '@/helpers/schema.json';
import { abi } from '@/helpers/abi/ERC20.json';
import { abiToDefinition, isValid } from '@/helpers/form';

const definition = abiToDefinition(abi[4]);

// const definition = schema.definitions.Profile;

const input = ref({
  spender: '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7'
});

watch(input.value, () => {
  console.log('Changed', input.value);
  console.log('Is valid', isValid(definition, input.value));
});
</script>

<template>
  <Layout>
    <template #content-left>
      <Block>
        <VObject v-model="input" :definition="definition" />
        <code>
          <pre>{{ JSON.stringify(input, null, 2) }}</pre>
        </code>
      </Block>
    </template>
  </Layout>
</template>
