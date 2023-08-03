<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const titleSearch = computed(() => (route.query.q as string) || '');

function handleUpdateSearch(e: string) {
  router.push({
    query: { ...route.query, q: e || undefined }
  });
}
</script>

<template>
  <div
    class="w-full rounded-full border border-skin-border pl-3 pr-0 focus-within:!border-skin-text md:max-w-[340px]"
  >
    <div class="flex">
      <BaseSearch
        :model-value="titleSearch"
        :placeholder="$t('searchPlaceholder')"
        class="flex-auto pr-2"
        @update:model-value="handleUpdateSearch"
      />
      <div class="flex h-[44px] items-center border-l">
        <SpaceProposalsSearchFilter />
      </div>
    </div>
  </div>
</template>
