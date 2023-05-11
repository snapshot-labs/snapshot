<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { format } from 'path';

const { fetchDelegates, delegates } = useDelegates();
const { profiles, loadProfiles } = useProfiles();
const { getUsername } = useUsername();
const { formatCompactNumber } = useIntl();

const props = defineProps<{
  space: ExtendedSpace;
}>();

const sortedDelegates = computed(() => {
  return delegates.value.sort((a, b) => {
    return Number(b.delegatedVotes) - Number(a.delegatedVotes);
  });
});

watch(delegates, () => {
  loadProfiles(delegates.value.map(delegate => delegate.id));
});

onMounted(() => {
  fetchDelegates();
});
</script>

<template>
  <BaseContainer>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <LoadingPage v-if="!delegates.length" />
      <div
        v-for="(delegate, i) in sortedDelegates"
        :key="i"
        class="flex flex-col justify-between rounded-xl border p-4"
      >
        <div class="flex">
          <AvatarUser :address="delegate.id" size="48" />
          <div class="ml-3">
            <div class="font-semibold text-skin-heading">
              {{ getUsername(delegate.id, profiles[delegate.id]) }}
            </div>
            <div>
              {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
              {{ space.symbol }}
            </div>
          </div>
        </div>
        <div class="mt-4 line-clamp-4 h-full">
          <span v-if="i === 1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui
            repudiandae reprehenderit repellat, reiciendis modi tempora eaque
            velit magnam rem perferendis.
          </span>

          <span v-else> This delegate hasn't added a statement yet. </span>
        </div>
        <div class="mt-4 flex items-center justify-between">
          {{
            formatCompactNumber(Number(delegate.tokenHoldersRepresentedAmount))
          }}
          delegators

          <TuneButton> Delegate </TuneButton>
        </div>
      </div>
    </div>
  </BaseContainer>
</template>
