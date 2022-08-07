<script setup lang="ts">
import { computed } from 'vue';
import { useClient, useSharing, useWeb3 } from '@/composables';
import { getChoiceString } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const { isGnosisSafe } = useClient();
const { shareVote } = useSharing();
const { web3Account } = useWeb3();

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  proposal: Proposal;
  selectedChoices: any;
}>();

const emit = defineEmits(['close']);

const imgPath = computed(() => {
  return isGnosisSafe.value
    ? '/stickers/just_signed.png'
    : '/stickers/hooray.png';
});

function share() {
  shareVote(
    props.space,
    props.proposal,
    getChoiceString(props.proposal, props.selectedChoices)
  );
}
</script>

<template>
  <BaseModal :open="open" max-height="550px" @close="emit('close')">
    <div class="flex flex-col justify-between p-4 md:h-auto">
      <div>
        <img
          :src="imgPath"
          class="mx-auto mt-5 h-[220px] sm:h-[300px] md:h-[220px]"
          alt="hooray sticker"
        />
        <div class="mt-4 text-center">
          <template v-if="isGnosisSafe">
            <h3 v-text="$t('proposal.postVoteModal.gnosisSafeTitle')" />
            <p
              class="italic"
              v-text="$t('proposal.postVoteModal.gnosisSafeDescription')"
            />
          </template>

          <template v-else>
            <h3 v-text="$t('proposal.postVoteModal.defaultTitle')" />
            <p class="italic" v-text="$t('proposal.postVoteModal.tips.1')" />
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="space-y-2">
        <BaseLink
          v-if="isGnosisSafe"
          :link="`https://gnosis-safe.io/app/eth:${web3Account}/transactions/queue`"
          hide-external-icon
        >
          <BaseButton class="w-full">
            <div class="flex flex-grow items-center justify-center gap-1">
              {{ $t('proposal.postVoteModal.seeQueue') }}
              <i-ho-external-link class="text-sm" />
            </div>
          </BaseButton>
        </BaseLink>
        <BaseButton
          v-else
          class="flex !h-[42px] w-full items-center justify-center gap-2"
          @click="share"
        >
          <BaseIcon name="twitter" size="24" class="text-[#1DA1F2]" />
          {{ $t('shareOnTwitter') }}
        </BaseButton>
        <BaseButton primary class="!h-[42px] w-full" @click="emit('close')">
          {{ $t('close') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
