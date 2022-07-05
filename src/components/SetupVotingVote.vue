<script setup lang="ts">
import { ref, computed } from 'vue';

const votingItems = computed(() => {
  return ['whitelist', 'sybil'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const input = ref(votingItems.value[0]);

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
</script>

<template>
  <div>
    <BaseBlock title="Setup voting">
      <div class="w-2/3 space-y-3">
        <BaseListbox v-model="input" :items="votingItems" label="Select type">
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
              <span>{{
                item.name === 'poh' ? 'Proof of humanity' : 'BrightID'
              }}</span>
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
    </BaseBlock>
  </div>
</template>
