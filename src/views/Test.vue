<script setup>
import { ref } from 'vue';
import schema from '@/helpers/schema.json';

const definition = schema.definitions.Profile;

const input = ref({
  name: 'Heyyy',
  isGreat: true
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
