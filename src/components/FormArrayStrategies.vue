<script setup lang="ts">
import { SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  modelValue?: { name: string; network: string; params: any }[];
  votingStrategies: SpaceStrategy[];
}>();

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const updateIndex = ref(0);

const { filterStrategies, getStrategies, strategies } = useStrategies();

const input = ref<{ name: string; network: string; params: any }[]>(
  props.modelValue || []
);

const strategyValidationStates = ref<boolean[]>([]);
const strategiesRef = ref();

function handleDelete(index: number) {
  input.value.splice(index, 1);
  strategyValidationStates.value.splice(index, 1);
}

function handleCopyStrategies() {
  updateIndex.value++;
  input.value = clone(props.votingStrategies);
}

function forceShowError() {
  strategiesRef?.value?.forEach((ref: any) => {
    if (ref?.forceShowError) {
      ref?.forceShowError();
    }
  });
}

defineExpose({
  forceShowError
});

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
    input.value.push({ name: 'ticket', network: '1', params: {} });
});
</script>

<template>
  <div>
    <div v-if="!strategies.length" class="mt-3 flex justify-center">
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
          <TuneCombobox
            :label="$t('strategy')"
            :items="filterStrategies().map(s => ({ id: s.id, name: s.id }))"
            :model-value="input[i].name"
            @update:model-value="value => (input[i].name = value)"
          />

          <ComboboxNetwork
            :network="input[i].network"
            @select="value => (input[i].network = value)"
          />

          <FormObjectStrategyParams
            :key="updateIndex"
            ref="strategiesRef"
            v-model="input[i].params"
            :strategy-name="input[i].name"
            @update:is-valid="strategyValidationStates[i] = $event"
          />
        </div>

        <TuneButton
          class="flex w-full items-center justify-center gap-2"
          @click="input.push({ name: 'ticket', network: '1', params: {} })"
        >
          <i-ho-plus class="text-sm" />
          {{ $t('addStrategy') }}
        </TuneButton>

        <TuneButton
          v-if="votingStrategies.length"
          class="flex w-full items-center justify-center gap-2"
          @click="handleCopyStrategies"
        >
          <i-ho-duplicate />
          {{ $t('copyVotingStrategies') }}
        </TuneButton>
      </div>
    </div>
  </div>
</template>
