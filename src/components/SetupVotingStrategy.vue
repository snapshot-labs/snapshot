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
      @update-strategies="val => (form.strategies = val)"
      @update-network="val => (form.network = val)"
      @update-symbol="val => (form.symbol = val)"
    />
    <BaseButton primary class="float-right mt-4" @click="emit('next')">
      Next
    </BaseButton>
  </div>
</template>
