<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const stateFilter = computed(() => (route.query.state as string) || 'all');
const showOnlyCore = computed(() => (route.query.onlyCore as string) || '0');
const showFlagged = computed(() => (route.query.showFlagged as string) || '0');

const stateFilters = computed(() => [
  {
    text: t('proposals.states.all'),
    action: 'all',
    extras: { selected: stateFilter.value === 'all' }
  },
  {
    text: t('proposals.states.active'),
    action: 'active',
    extras: { selected: stateFilter.value === 'active' }
  },
  {
    text: t('proposals.states.pending'),
    action: 'pending',
    extras: { selected: stateFilter.value === 'pending' }
  },
  {
    text: t('proposals.states.closed'),
    action: 'closed',
    extras: { selected: stateFilter.value === 'closed' }
  }
]);

function updateFilters(e: string) {
  router.push({
    query: { ...route.query, state: e || undefined }
  });
}

function updateCore(e: boolean) {
  router.push({
    query: { ...route.query, onlyCore: e ? '1' : undefined }
  });
}

function updateFlagged(e: boolean) {
  router.push({
    query: { ...route.query, showFlagged: e ? '1' : undefined }
  });
}
</script>

<template>
  <BasePopover :focus="false" class="h-full">
    <template #button>
      <BaseButtonIcon class="flex h-full w-[54px] justify-center outline-none">
        <i-ho-adjustments class="mr-1 text-base text-skin-link" />
      </BaseButtonIcon>
    </template>
    <template #content>
      <div>
        <h3 class="-mb-2 mt-3 text-center text-skin-heading">Filters</h3>
        <div class="m-4 space-y-3">
          <div class="space-y-2">
            <span class="text-skin-heading"> Proposal status </span>
            <TuneRadio
              v-for="(state, index) in stateFilters"
              :id="JSON.stringify(index)"
              :key="state.action"
              :value="state.action"
              :hint="state.text"
              :model-value="stateFilter"
              @update:model-value="updateFilters($event as string)"
            />
          </div>
          <div class="space-y-2">
            <span class="text-skin-heading"> More </span>
            <TuneCheckbox
              id="onlyCore"
              :model-value="showOnlyCore === '1'"
              hint="Only core member proposals"
              name="onlyCore"
              @update:model-value="updateCore($event as boolean)"
            />
            <TuneCheckbox
              id="showFlagged"
              :model-value="showFlagged === '1'"
              hint="Show flagged proposals"
              name="showFlagged"
              @update:model-value="updateFlagged($event as boolean)"
            />
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
