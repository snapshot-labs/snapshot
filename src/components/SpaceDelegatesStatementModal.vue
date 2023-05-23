<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  address: string;
}>();

const emit = defineEmits(['close', 'reload']);

const statement = ref(
  `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate sit rerum corrupti odit et quos facere saepe tempore ipsam facilis, doloremque ex ratione repellat cum repudiandae, quis consectetur distinctio deleniti!`
);
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <template #header>
      <h3>Edit statement</h3>
    </template>

    <div class="space-y-2 p-4">
      <TuneTextarea v-model="statement" />
    </div>

    <template #footer>
      <TuneButton class="w-full" primary @click="null">
        {{ $t('save') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
