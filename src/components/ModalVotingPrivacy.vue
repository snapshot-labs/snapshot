<script setup lang="ts">
defineProps<{
  open: boolean;
  selected?: string;
  allowAny?: boolean;
  allowNone?: boolean;
}>();

const emit = defineEmits(['close', 'update:selected']);

const types = ['shutter'];

function select(id) {
  emit('update:selected', id);
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('privacy.title') }}</h3>
    </template>
    <div class="mx-0 my-4 flex flex-col space-y-3 md:mx-4">
      <a v-if="allowAny" @click="select(undefined)">
        <BaseModalSelectItem :selected="!selected" :title="$t('privacy.any')" />
      </a>
      <a v-else-if="allowNone" @click="select('')">
        <BaseModalSelectItem
          :selected="!selected"
          :title="$t('privacy.none')"
        />
      </a>
      <a v-for="(type, key) in types" :key="key" @click="select(type)">
        <BaseModalSelectItem
          :selected="type === selected"
          :title="$t(`privacy.${type}.label`)"
          :description="$t(`privacy.${type}.description`)"
        />
      </a>
    </div>
  </BaseModal>
</template>
