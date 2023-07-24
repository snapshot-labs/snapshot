<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { toggleMintStatus } = useNFTClaimer(props.space);
const { getContractInfo, init, inited } = useNFTClaimerStorage();

const formRef = ref<any>(null);
const isLoading = ref(false);
// TODO Enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = ref(true);

const contractInfo = computed(() => {
  return getContractInfo(props.space.id);
});

const isViewOnly = computed(() => {
  return !isSpaceController.value || formRef.value?.loading;
});

function toggleStatus() {
  toggleMintStatus(!contractInfo.value.enabled);
}

function resetForm() {
  formRef.value?.resetForm();
}

function submit() {
  formRef.value?.submit();
}

watch(
  () => web3Account.value,
  () => {
    // TODO remove in prod
    isSpaceController.value = !!web3Account.value;
  },
  { immediate: true }
);

onMounted(() => {
  init(props.space);
});
</script>

<template>
  <LoadingRow v-if="!inited" block />
  <template v-else class="flex flex-col gap-y-3">
    <BaseMessageBlock
      v-if="!isSpaceController"
      class="md:mx-0"
      level="info"
      is-responsive
    >
      You are in view only mode, to modify space settings connect with a
      controller wallet.
    </BaseMessageBlock>
    <BaseBlock v-if="contractInfo" title="Mint status">
      <div class="flex gap-x-4">
        <div class="grow">
          <p>
            At any time, you can disable/enable the minting status of this
            space. Disabling will only prevent minting of future NFTs, and does
            not affect existing tokens.
          </p>
        </div>
        <div>
          <BaseButton
            class="whitespace-nowrap"
            :variant="contractInfo.enabled ? 'danger' : undefined"
            :disabled="isViewOnly"
            @click="toggleStatus()"
          >
            {{ contractInfo.enabled ? 'Disable' : 'Enable' }} minting
          </BaseButton>
        </div>
      </div>
    </BaseBlock>
    <div v-if="contractInfo" class="flex flex-col gap-y-3">
      <BaseBlock slim title="SnapIt!">
        <BaseMessage level="info" class="mb-3 border-b bg-slate-500/5 p-3">
          Updates will not apply to proposals with existing mints
        </BaseMessage>
        <div class="m-4 flex flex-col gap-y-3">
          <NFTClaimerSettingForm
            ref="formRef"
            :space="space"
            @startLoading="isLoading = true"
            @endLoading="isLoading = false"
          />
        </div>
      </BaseBlock>

      <div class="flex gap-5 px-4 pt-2 md:px-0">
        <BaseButton
          class="mb-2 block w-full"
          :disabled="isViewOnly"
          @click="resetForm"
        >
          {{ $t('reset') }}
        </BaseButton>
        <BaseButton
          primary
          class="block w-full"
          :disabled="isViewOnly"
          :loading="isLoading"
          @click="submit"
        >
          Save
        </BaseButton>
      </div>
    </div>

    <NFTClaimerSetupBaseBlock
      v-else
      :space="space"
      :is-view-only="!isSpaceController"
    />
  </template>
</template>
