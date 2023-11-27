<script setup lang="ts">
const schema = {
  type: 'object',
  title: 'Space',
  additionalProperties: true,
  required: ['name', 'about', 'categories'],
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      minLength: 1,
      examples: ['Space name']
    },
    about: {
      type: 'string',
      format: 'long',
      title: 'About',
      description: 'A short description of your space.',
      examples: ['Space description'],
      minLength: 1
    },
    categories: {
      type: 'array',
      title: 'Categories',
      examples: ['Select categories'],
      minLength: 1,
      items: {
        type: 'string',
        anyOf: [
          {
            const: 'social',
            title: 'Social'
          },
          {
            const: 'service',
            title: 'Service'
          }
        ]
      }
    },
    twitter: {
      type: 'string',
      title: 'Twitter',
      examples: ['Twitter handle']
    },
    private: {
      type: 'boolean',
      title: 'private',
      description: 'Set space to private.'
    },
    votingType: {
      type: 'string',
      title: 'Voting type',
      description: 'Enforce voting type for your space.',
      anyOf: [
        {
          const: 'single-choice',
          title: 'Single choice'
        },
        {
          const: 'approval',
          title: 'Approval'
        }
      ]
    }
  }
};

const input = ref({
  name: '',
  about: '',
  categories: [],
  twitter: '',
  private: false,
  votingType: ''
});
const formRef = ref();

function forceShowError() {
  formRef?.value?.forceShowError();
}
</script>

<template>
  <Story>
    <TuneForm
      ref="formRef"
      v-model="input"
      :definition="schema"
      :error="{
        name: 'Invalid field',
        about: 'Invalid field',
        categories: 'Invalid field'
      }"
    />
    <TuneButton primary class="mt-3" @click="forceShowError">
      Show errors
    </TuneButton>
  </Story>
</template>
