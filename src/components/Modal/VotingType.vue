<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'update:modelValue']);

const types = [
  'single-choice',
  'approval',
  'quadratic',
  'ranked-choice',
  'weighted'
];

function select(id) {
  emit('update:modelValue', id);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('voting.selectVoting') }}</h3>
    </template>
    <div class="mt-4 mx-0 md:mx-4">
      <a v-for="type in types" :key="type" @click="select(type)">
        <Block class="button--submit">
          <h3 v-text="$t(`voting.${type}`)" />
          <div v-text="$t(`voting.description.${type}`)" class="text-color" />
        </Block>
      </a>
    </div>
  </UiModal>
</template>
