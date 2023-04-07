<script setup lang="ts">
defineProps<{
  open: boolean;
  selected: string;
  allowAny: boolean;
}>();

const emit = defineEmits(['close', 'update:selected']);

const types = [
  'single-choice',
  'approval',
  'quadratic',
  'ranked-choice',
  'weighted',
  'basic'
];

function select(id) {
  emit('update:selected', id);
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('voting.selectVoting') }}</h3>
    </template>
    <div class="mx-0 my-4 flex flex-col space-y-3 md:mx-4">
      <button v-if="allowAny" @click="select(undefined)">
        <BaseModalSelectItem
          :selected="!selected"
          :title="$t('settings.anyType')"
        />
      </button>
      <button v-for="(type, key) in types" :key="key" @click="select(type)">
        <BaseModalSelectItem
          :selected="type === selected"
          :title="$t(`voting.${type}.label`)"
          :description="$t(`voting.${type}.description`)"
        />
      </button>
    </div>
  </BaseModal>
</template>
