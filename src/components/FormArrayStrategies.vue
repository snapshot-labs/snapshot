<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

import { useStrategies } from '@/composables';

const props = defineProps<{
  modelValue: { name: string; network: string; params: any }[];
}>();

const emit = defineEmits(['update:modelValue']);

const { filterStrategies, getStrategies, strategies } = useStrategies();

const searchInput = ref('');

const input = ref<{ name: string; network: string; params: any }[]>(
  props.modelValue || []
);

watch(
  input.value,
  () => {
    emit('update:modelValue', input.value);
  },
  { deep: true }
);

onMounted(() => {
  if (!strategies.value.length) getStrategies();
  if (!input.value.length)
    input.value.push({ name: 'erc20-balance-of', network: '1', params: {} });
});
</script>

<template>
  <div>
    <div v-if="!strategies.length" class="flex justify-center">
      <LoadingSpinner />
    </div>
    <div v-else class="mt-3 space-y-3">
      <div
        v-for="(property, i) in input"
        :key="i"
        class="space-y-2 rounded-md border p-3"
      >
        {{ i + 1 }}
        <BaseCombobox
          :label="$t('strategy')"
          :items="
            filterStrategies(searchInput).map(s => ({ id: s.id, name: s.id }))
          "
          :selected-id="input[i].name"
          @select="value => (input[i].name = value.id)"
          @search="value => (searchInput = value)"
        />
        <ComboboxNetwork
          :network="input[i].network"
          @select="value => (input[i].network = value)"
        />
        <FormObjectStrategyParams
          v-model="input[i].params"
          :strategy-name="input[i].name"
        />
      </div>
      <BaseButton
        class="mt-3 w-full"
        @click="
          input.push({ name: 'erc20-balance-of', network: '1', params: {} })
        "
      >
        {{ $t('add') }}
      </BaseButton>
    </div>
  </div>
</template>
