<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  username: '',
  avatar: '',
  bio: ''
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row justify-center items-center">
        <h3>{{ $t('settings.test') }}</h3>
      </div>
    </template>

    <div class="p-4">
      <!-- <BaseInput v-model="form.username" type="number" error="Test" /> -->
    </div>
    <template v-slot:footer> </template>
  </BaseModal>
</template>
