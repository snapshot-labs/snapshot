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
const { formatCompactNumber, formatPercentNumber } = useIntl();
const { fetchDelegate, delegate } = useDelegates(props.space.delegation);
const { domain } = useApp();

const showModalStatement = ref(false);

watch(
  () => props.address,
  async () => {
    fetchDelegate(props.address);
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
                  content: formatPercentNumber(delegate.votesPercentage)
                }"
              >
                {{ formatCompactNumber(Number(delegate.delegatedVotes)) }}
                {{ space.symbol }}
              </div>
              <div
                v-tippy="{
                  content: formatPercentNumber(delegate.delegatorsPercentage)
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

      <LoadingList v-if="!delegate" class="mt-4" />
      <p v-else class="mt-4">
        <span class="">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate
          sit rerum corrupti odit et quos facere saepe tempore ipsam facilis,
          doloremque ex ratione repellat cum repudiandae, quis consectetur
          distinctio deleniti!
        </span>
        <button
          v-if="web3Account === address"
          class="flex cursor-pointer items-center gap-1 text-skin-link"
          @click="
            emit('close');
            showModalStatement = true;
          "
        >
          Edit statement
        </button>
      </p>
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
      :profiles="profiles"
      :address="address"
      @close="showModalStatement = false"
    />
  </Teleport>
</template>
