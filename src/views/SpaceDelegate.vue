<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { useConfirmDialog } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const INITIAL_STATEMENT = {
  about: '',
  statement: ''
};

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { formatCompactNumber, formatNumber } = useIntl();
const { getProfile } = useProfiles();
const { saveStatement, savingStatement } = useStatement();
const route = useRoute();

const {
  loadDelegate,
  fetchDelegatingTo,
  delegate,
  delegatesStats,
  isLoadingDelegate,
  isLoadingDelegatingTo
} = useDelegates(props.space);
const { reloadStatement, getStatement, formatPercentageNumber } =
  useStatement();
const { modalAccountOpen } = useModal();

const showEdit = ref(false);
const showDelegateModal = ref(false);
const web3AccountDelegatingTo = ref('');
const fetchedStatement = ref(INITIAL_STATEMENT);
const statementForm = ref(INITIAL_STATEMENT);

const address = computed(() => route.params.address as string);

const edited = computed(() => {
  return (
    fetchedStatement.value?.about !== statementForm.value?.about ||
    fetchedStatement.value?.statement !== statementForm.value?.statement
  );
});

const isLoggedUser = computed(() => {
  return web3Account.value?.toLowerCase() === address.value?.toLowerCase();
});

const showUndelegate = computed(() => {
  return (
    web3AccountDelegatingTo.value?.toLowerCase() ===
    address.value?.toLowerCase()
  );
});

const delegateStats = computed(() => {
  return delegatesStats.value?.[address.value];
});

const delegatorItems = computed(() => {
  return [
    {
      label: props.space.symbol,
      value: formatCompactNumber(Number(delegate.value?.delegatedVotes || 0)),
      tooltip: `${formatNumber(
        Number(delegate.value?.delegatedVotes)
      )} (${formatPercentageNumber(Number(delegate.value?.votesPercentage))})`
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

async function saveStatementForm() {
  if (!showEdit.value) showEdit.value = true;
  try {
    await saveStatement(props.space.id, statementForm.value);
    reloadStatement(props.space.id, address.value);
    fetchedStatement.value = clone(statementForm.value);
    showEdit.value = false;
  } catch (e) {
    console.log(e);
  }
}

async function loadDelegatingTo() {
  web3AccountDelegatingTo.value = await fetchDelegatingTo(web3Account.value);
}

async function handleReload() {
  loadDelegate(address.value);
  loadDelegatingTo();
}

async function init() {
  loadDelegatingTo();
  await loadDelegate(address.value);
  statementForm.value = getStatement(address.value);
  fetchedStatement.value = getStatement(address.value);
}

function handleClickDelegate() {
  if (!web3Account.value) {
    modalAccountOpen.value = true;
    return;
  }

  showDelegateModal.value = true;
}

watch(address, init, {
  immediate: true
});

watch(address, () => {
  showEdit.value = false;
});

watch(web3Account, async () => {
  loadDelegatingTo();
});

const {
  isRevealed: isConfirmLeaveOpen,
  reveal: openConfirmLeave,
  confirm: confirmLeave,
  cancel: cancelLeave
} = useConfirmDialog();

onBeforeRouteLeave(async () => {
  if (edited.value) {
    const { data } = await openConfirmLeave();
    if (!data) return false;
  }
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
        :statement="statementForm"
        :edited="edited"
        :saving="savingStatement"
        class="mt-[16px]"
        @save="saveStatementForm"
        @update:about="statementForm.about = $event"
        @update:statement="statementForm.statement = $event"
      />

      <TheLayout v-else reverse class="pt-[12px]">
        <template #content-left>
          <div class="px-4 md:px-0">
            <LoadingPage v-if="isLoadingDelegate" slim />
            <div v-else class="space-y-[40px]">
              <div>
                <h3 class="mb-2 mt-0">About</h3>
                <p
                  v-if="statementForm.about"
                  class="text-[19px] text-skin-heading sm:text-[22px] sm:leading-7"
                >
                  {{ statementForm.about }}
                </p>
                <div v-else>No about provided yet</div>
              </div>

              <div>
                <h3 class="m-0 mb-2">Statement</h3>
                <BaseMarkdown
                  v-if="statementForm.statement"
                  :body="statementForm.statement"
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
            <div class="flex items-center">
              <div>
                <AvatarUser :address="address" size="40" />
              </div>
              <div class="ml-2">
                <ProfileName
                  :profile="getProfile(address)"
                  :address="address"
                  class="leading-6"
                />
                <ProfileAddressCopy :user-address="address" />
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
                  v-if="!showUndelegate"
                  class="w-full md:mt-3"
                  primary
                  :loading="isLoadingDelegatingTo"
                  @click="handleClickDelegate"
                >
                  {{ isLoggedUser ? 'Delegate to yourself' : 'Delegate' }}
                </BaseButton>

                <div
                  v-else
                  v-tippy="{ content: 'You can not un-delegate from yourself' }"
                  class="w-full md:mt-3"
                >
                  <BaseButton
                    variant="danger"
                    class="w-full"
                    :disabled="isLoggedUser"
                    @click="showDelegateModal = true"
                  >
                    Un-delegate
                  </BaseButton>
                </div>
              </div>
            </TheActionbar>
          </BaseBlock>
        </template>
      </TheLayout>
    </div>
    <Teleport to="body">
      <SpaceDelegatesDelegateModal
        :open="showDelegateModal"
        :space="space"
        :address="showUndelegate ? web3Account : address"
        @close="showDelegateModal = false"
        @reload="handleReload"
      />
      <ModalConfirmLeave
        :open="isConfirmLeaveOpen"
        show-cancel
        @close="cancelLeave"
        @save="saveStatementForm"
        @leave="confirmLeave(true)"
      />
    </Teleport>
  </div>
</template>
