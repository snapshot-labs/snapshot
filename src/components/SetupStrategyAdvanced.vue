<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
const { form } = useSpaceSettingsForm();

const emit = defineEmits(['next']);
</script>

<template>
  <div>
    <SettingsStrategiesBlock
      title="Setup your voting strategy"
      :form="form"
      hide-error
      @update-strategies="val => (form.strategies = val)"
      @update-network="val => (form.network = val)"
      @update-symbol="val => (form.symbol = val)"
    />
    <div class="mx-4 md:mx-0">
      <SetupButtonNext
        :text="form.strategies.length ? 'next' : 'skip'"
        @click="emit('next')"
      />
    </div>
  </div>
</template>
