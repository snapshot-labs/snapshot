<script setup lang="ts">
import { ExtendedSpace, Profile } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  profiles: Record<string, Profile>;
  space: ExtendedSpace;
  address: string;
}>();

const emit = defineEmits(['close', 'delegate']);

const { web3Account } = useWeb3();
const { formatCompactNumber } = useIntl();
const {
  fetchDelegate,
  fetchDelegateVotesAndProposals,
  delegate,
  delegatesStats
} = useDelegates(props.space.delegationPortal);
const {
  loadingStatements,
  loadStatements,
  reloadStatement,
  getStatementAbout,
  getStatementStatement,
  formatPercentageNumber
} = useStatement();

const showModalStatement = ref(false);
const showEdit = ref(false);

const isLoggedUser = computed(() => {
  return web3Account.value.toLowerCase() === props.address.toLowerCase();
});

const delegateStats = computed(() => {
  return delegatesStats.value?.[props.address];
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
  await reloadStatement(props.space.id, props.address);
  showEdit.value = false;
}

watch(
  () => props.address,
  async () => {
    fetchDelegate(props.address);
    fetchDelegateVotesAndProposals([props.address], props.space.id);
    loadStatements(props.space.id, [props.address]);
  },
  {
    immediate: true
  }
);
</script>

<template>
  <BaseModalFullscreen :open="open" @close="emit('close')">
    <BaseContainer>
      <div v-if="isLoggedUser">
        <BaseButton @click="showEdit = !showEdit"> Edit</BaseButton>
      </div>
    </BaseContainer>

    <TheLayout v-if="!showEdit" class="pt-3">
      <template #content-left>
        <div class="space-y-[40px]">
          <div v-if="getStatementAbout(address)">
            <h3 class="mb-2 mt-0">About</h3>
            <p class="text-[22px] leading-7">
              {{ getStatementAbout(address) }}
            </p>
          </div>

          <div v-if="getStatementStatement(address)">
            <h3 class="m-0 mb-2">Statement</h3>
            <BaseMarkdown :body="getStatementStatement(address)!" />
          </div>

          <div
            v-if="
              !getStatementAbout(address) && !getStatementStatement(address)
            "
            @click="
              emit('close');
              showModalStatement = true;
            "
          >
            No statement provided yet
          </div>
        </div>
      </template>

      <template #sidebar-right>
        <BaseBlock slim class="p-3">
          <div class="flex">
            <div>
              <AvatarUser :address="address" size="40" />
            </div>
            <div>
              <ProfileName :profile="profiles[address]" :address="address" />
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
          <BaseButton
            class="mt-3 w-full"
            primary
            @click="emit('delegate', address)"
          >
            Delegate
          </BaseButton>
        </BaseBlock>
      </template>
    </TheLayout>

    <SpaceDelegatesProfileModalEdit
      v-else
      :space="space"
      :address="address"
      :about="getStatementAbout(address)"
      :statement="getStatementStatement(address)"
      @reload="handleReload"
    />
  </BaseModalFullscreen>
</template>
