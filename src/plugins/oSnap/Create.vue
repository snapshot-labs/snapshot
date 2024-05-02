<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { cloneDeep } from 'lodash';
import {
  GnosisSafe,
  Network,
  OsnapPluginData,
  Transaction,
  nonNullable
} from './types';
import { getIsOsnapEnabled, getModuleAddressForTreasury } from './utils';
import CreateSafe from './CreateSafe.vue';
import { toChecksumAddress } from '@/helpers/utils';
import OsnapMarketingWidget from './components/OsnapMarketingWidget.vue';

const props = defineProps<{
  space: ExtendedSpace;
}>();

// we need to disable using the new plugin if the old one is still installed
const hasLegacyPluginInstalled = 'safeSnap' in props.space.plugins;

const isLoading = ref(false);

// emits an event with the shape expected by the parent of the plugin component
const emit = defineEmits<{
  update: [value: { key: 'oSnap'; form: OsnapPluginData }];
}>();

const newPluginData = ref<OsnapPluginData>({
  safes: null
});

const updateSafes = (safes: GnosisSafe[]) => {
  newPluginData.value = { safes };
  emit('update', { key: 'oSnap', form: newPluginData.value });
};

const allSafes = ref<GnosisSafe[]>([]);
const configuredSafes = computed(() => newPluginData.value.safes ?? []);

const unconfiguredSafes = computed<GnosisSafe[]>(() => {
  if (newPluginData.value?.safes?.length && configuredSafes.value.length) {
    return allSafes.value.filter(safe =>
      !!findSafe(safe, configuredSafes.value) ? false : true
    );
  }
  return allSafes.value;
});

function safeEqual(safe1: GnosisSafe, safe2: GnosisSafe): boolean {
  return (
    safe1.safeAddress === safe2.safeAddress && safe1.network === safe1.network
  );
}

function findSafe(safeToFind: GnosisSafe, from: GnosisSafe[]) {
  return from.length
    ? from.find(safe => safeEqual(safe, safeToFind))
    : undefined;
}

// maps over the treasuries and creates a safe for each one
// only returns safes that have oSnap enabled
async function createOsnapEnabledSafes() {
  const treasuryPromises = await Promise.allSettled(
    props.space.treasuries.map(async treasury => {
      const isOsnapEnabled = await getIsOsnapEnabled(
        treasury.network as Network,
        treasury.address
      );
      return isOsnapEnabled ? treasury : null;
    })
  );

  const treasuriesWithOsnapEnabled = treasuryPromises
    .map(res => (res.status === 'fulfilled' ? res.value : null))
    .filter(nonNullable);

  const safePromises = await Promise.allSettled(
    treasuriesWithOsnapEnabled.map(async treasury => {
      const moduleAddress = await getModuleAddressForTreasury(
        treasury.network as Network,
        treasury.address
      );
      return moduleAddress
        ? {
            safeName: treasury.name,
            safeAddress: toChecksumAddress(treasury.address),
            network: treasury.network as Network,
            transactions: [] as Transaction[],
            moduleAddress
          }
        : null;
    })
  );

  const safes = safePromises
    .map(res => (res.status === 'fulfilled' ? res.value : null))
    .filter(nonNullable);

  return safes;
}

function addSafeToConfigure(safe: GnosisSafe) {
  updateSafes([...(newPluginData.value.safes ?? []), safe]);
}

function addNewSafe() {
  addSafeToConfigure(unconfiguredSafes.value[0]);
}

function removeSafe(safeIndex: number) {
  const copy = [...configuredSafes.value];
  copy.splice(safeIndex, 1);
  updateSafes(copy);
}

function updateSafe(safe: GnosisSafe, safeIndex: number) {
  const copy = [...configuredSafes.value];
  copy[safeIndex] = safe;
  updateSafes(copy);
}

onMounted(async () => {
  isLoading.value = true;
  allSafes.value = await createOsnapEnabledSafes();
  const initialSafe = cloneDeep(allSafes.value[0]);
  updateSafes([initialSafe]);
  isLoading.value = false;
});
</script>

<template>
  <div class="rounded-2xl border border-skin-border relative">
    <div v-if="!space.treasuries.length" class="rounded-2xl border p-4 text-md">
      <h2>Warning: no treasuries</h2>
      <p>
        You have installed the oSnap plugin, but you don't have any treasuries.
      </p>
      <p>
        Please add a Safe as a treasury and enable oSnap on it to use the oSnap
        plugin.
      </p>
    </div>
    <div
      v-else-if="hasLegacyPluginInstalled"
      class="rounded-2xl border p-4 text-md"
    >
      <h2 class="mb-2">Warning: Multiple oSnap enabled plugins detected</h2>
      <p class="mb-2">
        For best experience using oSnap, please remove the SafeSnap plugin from
        your space.
      </p>
    </div>

    <div v-else-if="isLoading" class="grid min-h-[180px] place-items-center">
      <h2 class="text-center">
        Loading oSnap Safes <LoadingSpinner class="ml-2 inline" big />
      </h2>
    </div>
    <div v-else-if="!allSafes.length">
      <h2>Warning: no oSnap safes found</h2>
      <p>
        You have installed the oSnap plugin, but you don't have any oSnap safes.
      </p>
      <p>
        Please add a Safe as a treasury and enable oSnap on it to use the oSnap
        plugin.
      </p>
    </div>
    <div
      v-else-if="!newPluginData.safes?.length"
      class="rounded-2xl border p-4 text-md"
    >
      <h4>Add treasuries to start building</h4>
    </div>
    <template v-else>
      <CreateSafe
        v-for="(safe, i) in newPluginData.safes"
        :class="{ 'border-t border-skin-border': i !== 0 }"
        :key="`${safe.network}:${safe.safeAddress}`"
        :safe="safe"
        :all-safes="allSafes"
        :unconfigured-safes="unconfiguredSafes"
        @remove-safe="() => removeSafe(i)"
        @update-safe="safe => updateSafe(safe, i)"
      />
    </template>
    <OsnapMarketingWidget class="absolute z-2 top-[-16px] right-[16px]" />
  </div>
  <TuneButton
    v-if="unconfiguredSafes.length"
    class="mt-4 w-full"
    @click="addNewSafe"
    >Add treasury +</TuneButton
  >
</template>
