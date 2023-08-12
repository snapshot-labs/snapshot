<script setup lang="ts">
import { ExtendedSpace, Profile } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  profiles: Record<string, Profile>;
  space: ExtendedSpace;
  address: string;
}>();

const emit = defineEmits(['close']);

const { web3Account } = useWeb3();
const { formatCompactNumber } = useIntl();
const { fetchDelegate, delegate } = useDelegates(props.space.delegationPortal);
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

async function handleReload() {
  await reloadStatement(props.space.id, props.address);
  showEdit.value = false;
}

watch(
  () => props.address,
  async () => {
    fetchDelegate(props.address);
    loadStatements(props.space.id, [props.address]);
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
    <TheLayout v-if="!showEdit">
      <template #sidebar-right>
        <BaseBlock>
          <div class="flex">
            <div>
              <AvatarUser :address="address" size="40" />
            </div>
            <div>
              <ProfileName :profile="profiles[address]" :address="address" />
              <div class="flex gap-3 pl-3 text-skin-text">
                <template v-if="delegate">
                  <div
                    v-tippy="{
                      content: formatPercentageNumber(delegate.votesPercentage)
                    }"
                  >
                    {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
                    {{ space.symbol }}
                  </div>
                  <div
                    v-tippy="{
                      content: formatPercentageNumber(
                        delegate.delegatorsPercentage
                      )
                    }"
                  >
                    {{
                      formatCompactNumber(
                        Number(delegate.tokenHoldersRepresentedAmount)
                      )
                    }}
                    delegators
                  </div>
                </template>
              </div>
            </div>
          </div>
        </BaseBlock>
      </template>

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
