<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSpaceForm } from '@/composables/useSpaceForm';

const emit = defineEmits(['next']);

const { form } = useSpaceForm('setup');

const votingItems = computed(() => {
  return ['whitelist', 'ticket'].map((name, i) => ({
    id: i + 1,
    name: name,
    value: name
  }));
});

const input = ref(votingItems.value[0].value);
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

  strategy.name = input.value;
  strategy.params.symbol = symbol.value;

  if (strategy.name === 'whitelist')
    strategy.params.addresses = whitelist.value;

  return strategy;
});

function setFormValues() {
  if (
    form.value.strategies.length === 1 &&
    ['whitelist', 'ticket'].includes(form.value.strategies[0].name)
  ) {
    input.value = form.value.strategies[0].name;
    symbol.value = form.value.strategies[0].params.symbol;
    if (form.value.strategies[0].name === 'whitelist') {
      whitelist.value = form.value.strategies[0].params.addresses || [];
    }
  }
}

function nextStep() {
  emit('next');
  form.value.strategies = [];
  form.value.strategies.push(strategy.value);
  const symbol = strategy.value.params.symbol || 'VOTE';
  form.value.symbol = symbol;
}

onMounted(setFormValues);
</script>

<template>
  <div>
    <BaseBlock title="Setup voting">
      <div class="space-y-3">
        <div class="space-y-3 md:flex md:w-2/3 md:space-y-0 md:space-x-4">
          <BaseListbox
            v-model="input"
            :items="votingItems"
            label="Strategy"
            class="w-full"
          >
            <template #selected="{ selectedItem }">
              <span>
                {{
                  selectedItem?.name === 'whitelist'
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
          <BaseInput v-model="symbol" title="Symbol" />
        </div>
        <div v-if="input === 'whitelist'" class="md:w-2/3">
          <LabelInput> Whitelisted addresses </LabelInput>
          <TextareaArray
            v-model="whitelist"
            :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
            class="s-input !rounded-3xl"
          />
        </div>
      </div>
    </BaseBlock>
    <div class="float-right mx-4 md:mx-0">
      <SetupButtonNext text="next" @click="nextStep" />
    </div>
  </div>
</template>
