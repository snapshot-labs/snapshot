<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const emit = defineEmits(['next']);

const { form } = useSpaceSettingsForm();

const votingItems = computed(() => {
  return ['whitelist', 'ticket'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const input = ref(votingItems.value[0]);
const symbol = ref('VOTE');

const whitelist = ref([]);

const strategy = computed(() => {
  const strategy: {
    name: string;
    params: {
      symbol: string;
      addresses?: string[];
    };
  } = {
    name: 'whitelist',
    params: {
      symbol: ''
    }
  };

  strategy.name = input.value.name;
  strategy.params.symbol = symbol.value;

  if (strategy.name === 'whitelist')
    strategy.params.addresses = whitelist.value;

  return strategy;
});

function nextStep() {
  emit('next');
  form.value.strategies = [];
  form.value.strategies.push(strategy.value);
  const symbol = strategy.value.params.symbol || 'VOTE';
  form.value.symbol = symbol;
}
</script>

<template>
  <div>
    <BaseBlock title="Setup voting">
      <div class="flex space-x-4">
        <div class="w-2/3 space-y-3">
          <BaseListbox v-model="input" :items="votingItems" label="Strategy">
            <template #selected="{ selectedItem }">
              <span>
                {{
                  selectedItem.name === 'whitelist'
                    ? 'Whitelist voting'
                    : 'Ticket voting'
                }}
              </span>
            </template>
            <template #item="{ item }">
              <span>
                {{
                  item.name === 'whitelist'
                    ? 'Whitelist voting'
                    : 'Ticket voting'
                }}
              </span>
            </template>
          </BaseListbox>
          <div v-if="input.name === 'whitelist'">
            <LabelInput> Whitelisted addresses </LabelInput>
            <TextareaArray
              v-model="whitelist"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="s-input !rounded-3xl"
            />
          </div>
        </div>
        <div>
          <BaseInput v-model="symbol" title="Symbol" />
        </div>
      </div>
    </BaseBlock>

    <BaseButton class="float-right mt-4" primary @click="nextStep">
      {{ $t('next') }}
    </BaseButton>
  </div>
</template>
