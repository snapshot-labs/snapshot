<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useStrategies } from '@/composables';

const props = defineProps<{
  modelValue: { name: string; network: string; params: any }[];
}>();

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const { filterStrategies, getStrategies, strategies } = useStrategies();

const input = ref<{ name: string; network: string; params: any }[]>(
  props.modelValue || []
);
const searchInput = ref('');
const strategyValidationStates = ref<boolean[]>([]);

function handleDelete(index: number) {
  input.value.splice(index, 1);
  strategyValidationStates.value.splice(index, 1);
}

watch(
  strategyValidationStates,
  () => {
    const isValid = Object.values(strategyValidationStates.value).every(
      v => v === true
    );
    emit('update:isValid', isValid);
  },
  { immediate: true, deep: true }
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
    <div v-else class="mt-3">
      <LabelInput>
        {{ $t('strategies') }}
      </LabelInput>
      <div class="space-y-3">
        <div
          v-for="(property, i) in input"
          :key="i"
          class="space-y-2 rounded-md border p-3"
        >
          <div class="mb-3 flex items-center justify-between">
            <BasePill class="text-[16px]">
              {{ i + 1 }}
            </BasePill>
            <BaseButtonIcon v-if="input.length > 1" @click="handleDelete(i)">
              <i-ho-trash class="text-[17px]" />
            </BaseButtonIcon>
          </div>
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
            @update:is-valid="strategyValidationStates[i] = $event"
          />
        </div>

        <BaseButton
          class="mt-3 w-full"
          @click="
            input.push({ name: 'erc20-balance-of', network: '1', params: {} })
          "
        >
          {{ $t('addStrategy') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
