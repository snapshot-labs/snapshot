<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const emit = defineEmits(['next']);

const { form } = useSpaceSettingsForm();

const votingItems = computed(() => {
  return ['whitelist', 'sybil'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const input = ref(votingItems.value[0]);
const symbol = ref('VOTE');

const sybilItems = computed(() => {
  return ['poh', 'brightId'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const selectedSybilItems = ref<{ id: number; name: string }[]>(
  sybilItems.value
);

const whitelist = ref([]);

function generateStrategy(type) {
  const strategy: {
    name: string;
    params: {
      symbol: string;
      addresses: string[];
    };
  } = {
    name: 'whitelist',
    params: {
      symbol: '',
      addresses: []
    }
  };

  const sybilStrategy: {
    name: string;
    params: {
      strategy: {
        name: string;
        params: {
          symbol: string;
        };
      };
      sybil: {
        [key: string]: string;
      };
    };
  } = {
    name: 'sybil-protection',
    params: {
      strategy: {
        name: 'ticket',
        params: {
          symbol: ''
        }
      },
      sybil: {
        poh: '0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb',
        brightId: 'v5'
      }
    }
  };

  return type === 'sybil' ? sybilStrategy : strategy;
}

const strategy = computed(() => {
  const strategy = generateStrategy(input.value.name);

  if (input.value.name === 'whitelist') {
    strategy.params.addresses = whitelist.value;
    strategy.params.symbol = symbol.value;
  } else if (input.value.name === 'sybil') {
    strategy.params.strategy.params.symbol = symbol.value;
    sybilItems.value.forEach(item => {
      // if poh or brightId isn't selected delete it from the sybil obj
      if (!selectedSybilItems.value.find(i => i.id === item.id)) {
        delete strategy.params.sybil[item.name];
      }
    });
  }

  return strategy;
});

function nextStep() {
  emit('next');
  form.value.strategies = [];
  form.value.strategies.push(strategy.value);
  const symbol =
    strategy.value.params.symbol ||
    strategy.value.params.strategy.params.symbol ||
    'VOTE';
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
                    : 'Sybil protected voting'
                }}
              </span>
            </template>
            <template #item="{ item }">
              <span>
                {{
                  item.name === 'whitelist'
                    ? 'Whitelist voting'
                    : 'Sybil protected voting'
                }}
              </span>
            </template>
          </BaseListbox>
          <div v-if="input.name === 'whitelist'">
            <LabelInput> Whitelist addresses </LabelInput>
            <TextareaArray
              v-model="whitelist"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="s-input !rounded-3xl"
            />
          </div>
          <div v-else-if="input.name === 'sybil'">
            <BaseListboxMultiple
              v-model="selectedSybilItems"
              :items="sybilItems"
              label="Select protection"
            >
              <template #item="{ item }">
                <span>
                  {{ item.name === 'poh' ? 'Proof of humanity' : 'BrightID' }}
                </span>
              </template>
              <template #selected="{ selectedItems }">
                <span>
                  {{
                    selectedItems
                      .map(item =>
                        item.name === 'poh' ? 'Proof of humanity' : 'BrightID'
                      )
                      .join(', ')
                  }}
                </span>
              </template>
            </BaseListboxMultiple>
          </div>
        </div>
        <div>
          <BaseInput v-model="symbol" title="Symbol" />
        </div>
      </div>
    </BaseBlock>
    <BaseBlock class="mt-4"> Demo: {{ strategy }} </BaseBlock>
    <BaseButton class="float-right mt-4" primary @click="nextStep">
      {{ 'Next' }}
    </BaseButton>
  </div>
</template>
