<script setup lang="ts">
const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);

const def = computed(() => {
  return {
    type: 'object',
    properties: {
      standard: {
        type: 'string',
        title: 'Standard',
        description: 'The standard used by your delegation contract',
        anyOf: [{ const: 'compound-governor', title: 'Compound governor' }]
      },
      contract: {
        type: 'string',
        format: 'address',
        title: 'Contract address',
        description: 'The address of your delegation contract',
        examples: ['0x3901D0fDe202aF1427216b79f5243f8A022d68cf']
      },
      subgraphUrl: {
        type: 'string',
        format: 'uri',
        title: 'Subgraph URL',
        description: 'The URL of your delegation subgraph',
        examples: [
          'https://api.thegraph.com/subgraphs/name/arr00/uniswap-governance-v2'
        ]
      }
    },
    additionalProperties: false
  };
});
</script>

<template>
  <BaseBlock title="Delegates portal">
    <BaseMessageBlock class="mb-3">
      Please ensure your token adheres to a compatible delegation standard to
      enable delegate discovery and activity within your Snapshot space.
    </BaseMessageBlock>
    <TuneForm v-model="form.delegation" :definition="def" :error="{}" />
  </BaseBlock>
</template>
