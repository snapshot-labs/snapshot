<script setup lang="ts">
import { ExtendedSpace, Profile } from '@/helpers/interfaces';
import { explorerUrl } from '@/helpers/utils';

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
const { domain } = useApp();
const {
  loadingStatements,
  loadStatements,
  reloadStatement,
  getStatementAbout,
  getStatementStatement,
  formatPercentageNumber
} = useStatement();

const showModalStatement = ref(false);

const isLoggedUser = computed(() => {
  return web3Account.value.toLowerCase() === props.address.toLowerCase();
});

watch(
  () => props.address,
  async () => {
    fetchDelegate(props.address);
    loadStatements(props.space.id, [props.address]);
  }
);
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <div class="p-4">
      <div class="flex">
        <div>
          <AvatarUser :address="address" size="69" />
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
                  content: formatPercentageNumber(delegate.delegatorsPercentage)
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

      <LoadingList v-if="loadingStatements" class="mt-4" />
      <div v-else class="mt-4 space-y-3">
        <div v-if="getStatementAbout(address)">
          <div class="flex items-center">
            About
            <BaseButtonIcon v-if="isLoggedUser">
              <i-ho-pencil
                class="text-xs"
                @click="
                  emit('close');
                  showModalStatement = true;
                "
              />
            </BaseButtonIcon>
          </div>
          <p class="text-skin-heading">
            {{ getStatementAbout(address) }}
          </p>
        </div>

        <div v-if="getStatementStatement(address)">
          <div class="flex items-center">
            Statement
            <BaseButtonIcon v-if="isLoggedUser">
              <i-ho-pencil
                class="text-xs"
                @click="
                  emit('close');
                  showModalStatement = true;
                "
              />
            </BaseButtonIcon>
          </div>
          <p class="text-skin-heading">
            <BaseMarkdown :body="getStatementStatement(address)!" />
          </p>
        </div>

        <div
          v-if="!getStatementAbout(address) && !getStatementStatement(address)"
          @click="
            emit('close');
            showModalStatement = true;
          "
        >
          No statement provided yet
          <button v-if="isLoggedUser" class="flex items-center text-skin-link">
            Add statement
          </button>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex w-full">
        <div class="w-1/2 pr-2">
          <BaseLink
            :link="
              domain
                ? `https://snapshot.org/#/profile/${address}`
                : { name: 'profileActivity', params: { address } }
            "
            hide-external-icon
          >
            <BaseButton primary class="w-full" tabindex="-1">
              {{ $t('profile.viewProfile') }}
            </BaseButton>
          </BaseLink>
        </div>
        <div class="w-1/2 pl-2">
          <BaseLink
            :link="
              explorerUrl(space?.network || space?.network || '1', address)
            "
            hide-external-icon
          >
            <BaseButton class="w-full" tabindex="-1">
              {{ $t('seeInExplorer') }}
              <i-ho-external-link class="mb-[2px] inline-block text-xs" />
            </BaseButton>
          </BaseLink>
        </div>
      </div>
    </template>
  </BaseModal>
  <Teleport to="body">
    <SpaceDelegatesStatementModal
      :open="showModalStatement"
      :space="space"
      :address="address"
      :about="getStatementAbout(address)"
      :statement="getStatementStatement(address)"
      @close="showModalStatement = false"
      @reload="reloadStatement(space.id, address)"
    />
  </Teleport>
</template>
