<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const emit = defineEmits(['close', 'delegate']);

const { web3Account } = useWeb3();
const { formatCompactNumber } = useIntl();
const { getProfile } = useProfiles();
const route = useRoute();

const { fetchDelegate, delegate, delegatesStats, isLoadingDelegate } =
  useDelegates(props.space);
const {
  reloadStatement,
  getStatementAbout,
  getStatementStatement,
  formatPercentageNumber
} = useStatement();

const showEdit = ref(false);

const address = computed(() => route.params.address as string);

const isLoggedUser = computed(() => {
  return web3Account.value.toLowerCase() === address.value.toLowerCase();
});

const delegateStats = computed(() => {
  return delegatesStats.value?.[address.value];
});

const delegatorItems = computed(() => {
  return [
    {
      label: props.space.symbol,
      value: formatCompactNumber(Number(delegate.value?.delegatedVotes || 0)),
      tooltip: formatPercentageNumber(delegate.value?.votesPercentage || 0)
    },
    {
      label: 'Delegators',
      value: formatCompactNumber(
        Number(delegate.value?.tokenHoldersRepresentedAmount || 0)
      ),
      tooltip: formatPercentageNumber(delegate.value?.delegatorsPercentage || 0)
    },
    {
      label: 'Proposals',
      value: formatCompactNumber(delegateStats.value?.proposals.length || 0),
      tooltip: null
    },
    {
      label: 'Votes',
      value: formatCompactNumber(delegateStats.value?.votes.length || 0),
      tooltip: null
    }
  ];
});

async function handleReload() {
  await reloadStatement(props.space.id, address.value);
  showEdit.value = false;
}

watch(
  address,
  async () => {
    fetchDelegate(address.value);
  },
  {
    immediate: true
  }
);

watch(address, () => {
  showEdit.value = false;
});
</script>

<template>
  <div class="mb-[80px] md:mb-0">
    <SpaceBreadcrumbs
      :space="space"
      class="mx-4 -mt-1 pb-[16px] lg:pb-[20px]"
    />

    <BaseContainer v-if="isLoggedUser" class="pb-2 pt-3 lg:py-[20px]">
      <ButtonSwitch
        v-model="showEdit"
        :state1="{
          name: 'Preview',
          value: false
        }"
        :state2="{
          name: 'Write',
          value: true
        }"
        class="w-full md:w-[180px]"
      />
    </BaseContainer>

    <div>
      <SpaceDelegateEdit
        v-if="showEdit"
        :space="space"
        :address="address"
        :about="getStatementAbout(address)"
        :statement="getStatementStatement(address)"
        class="mt-[16px]"
        @reload="handleReload"
      />

      <TheLayout v-else reverse class="pt-[12px]">
        <template #content-left>
          <div class="px-4 md:px-0">
            <LoadingPage v-if="isLoadingDelegate" slim />
            <div v-else class="space-y-[40px]">
              <div>
                <h3 class="mb-2 mt-0">About</h3>
                <p
                  v-if="getStatementAbout(address)"
                  class="text-[19px] text-skin-heading sm:text-[22px] sm:leading-7"
                >
                  {{ getStatementAbout(address) }}
                </p>
                <div v-else>No about provided yet</div>
              </div>

              <div>
                <h3 class="m-0 mb-2">Statement</h3>
                <BaseMarkdown
                  v-if="getStatementStatement(address)"
                  :body="getStatementStatement(address)!"
                  class="text-skin-heading"
                />
                <div v-else>No statement provided yet</div>
              </div>
            </div>
          </div>
        </template>

        <template #sidebar-right>
          <BaseBlock
            class="mb-5 lg:sticky lg:top-[110px] lg:mb-0 lg:mt-0 lg:w-[320px]"
          >
            <div class="flex">
              <div>
                <AvatarUser :address="address" size="40" />
              </div>
              <div class="ml-2">
                <ProfileName
                  :profile="getProfile(address)"
                  :address="address"
                />
              </div>
            </div>
            <div class="mt-3 space-y-2">
              <div
                v-for="(item, i) in delegatorItems"
                :key="i"
                class="flex justify-between"
              >
                <div>
                  {{ item.label }}
                </div>
                <div
                  v-tippy="{ content: item.tooltip }"
                  class="text-skin-heading"
                  :class="item.tooltip ? 'cursor-help' : ''"
                >
                  {{ item.value }}
                </div>
              </div>
            </div>
            <TheActionbar break-point="md">
              <div class="flex h-full items-center px-[20px] md:px-0">
                <BaseButton
                  class="w-full md:mt-3"
                  primary
                  @click="emit('delegate', address)"
                >
                  {{ isLoggedUser ? 'Delegate to yourself' : 'Delegate' }}
                </BaseButton>
              </div>
            </TheActionbar>
          </BaseBlock>
        </template>
      </TheLayout>
    </div>
  </div>
</template>
