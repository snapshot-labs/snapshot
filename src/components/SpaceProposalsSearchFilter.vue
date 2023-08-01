<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const stateFilter = computed(() => (route.query.state as string) || 'all');
const showOnlyCore = computed(() => (route.query.onlyCore as string) || '0');
const hideFlagged = computed(() => (route.query.hideFlagged as string) || '1');

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
    query: { ...route.query, hideFlagged: e ? '1' : undefined }
  });
}
</script>

<template>
  <BasePopover :focus="false">
    <template #button>
      <BaseButtonIcon>
        <i-ho-funnel class="mr-[2px] text-skin-link" />
      </BaseButtonIcon>
    </template>
    <template #content>
      <div>
        <h3 class="-mb-2 mt-3 text-center text-skin-heading">Filters</h3>
        <div class="m-4 space-y-3">
          <div class="space-y-2">
            <span class="text-skin-heading"> Proposal state </span>
            <TuneRadio
              v-for="state in stateFilters"
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
              :model-value="showOnlyCore === '1'"
              hint="Only core member proposals"
              name="onlyCore"
              @update:model-value="updateCore($event as boolean)"
            />
            <TuneCheckbox
              :model-value="hideFlagged === '1'"
              hint="Hide flagged proposals"
              name="hideFlagged"
              @update:model-value="updateFlagged($event as boolean)"
            />
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>
