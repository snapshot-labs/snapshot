<script setup lang="ts">
import { getChoiceString } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const { shareVote, shareProposalTwitter, shareProposalLenster } = useSharing();
const { web3Account } = useWeb3();
const { userState } = useEmailSubscription();

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  proposal: Proposal;
  selectedChoices: any;
  waitingForSigners: boolean;
}>();

const emit = defineEmits(['close', 'subscribeEmail']);

const subscribeEmail = () => {
  emit('subscribeEmail');
  emit('close');
};

const imgPath = computed(() => {
  return props.waitingForSigners
    ? '/stickers/just_signed.png'
    : '/stickers/hooray.png';
});

function share(shareTo: 'twitter' | 'lenster') {
  shareVote(shareTo, {
    space: props.space,
    proposal: props.proposal,
    choices: getChoiceString(props.proposal, props.selectedChoices)
  });
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
          <template v-if="props.waitingForSigners">
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
        <BaseButton
          class="flex !h-[42px] w-full items-center justify-center gap-2"
          @click="
            props.waitingForSigners
              ? shareProposalTwitter(space, proposal)
              : share('twitter')
          "
        >
          <i-s-twitter class="text-md text-[#1DA1F2]" />
          {{ $t('shareOnTwitter') }}
        </BaseButton>
        <BaseButton
          class="flex !h-[42px] w-full items-center justify-center gap-2"
          @click="
            props.waitingForSigners
              ? shareProposalLenster(space, proposal)
              : share('lenster')
          "
        >
          <i-s-lenster class="text-[#8B5CF6]" />
          {{ $t('shareOnLenster') }}
        </BaseButton>

        <BaseButton
          v-if="userState !== 'VERIFIED'"
          class="flex !h-[42px] w-full items-center justify-center gap-2"
          @click="subscribeEmail"
        >
          <i-ho-mail class="text-skin-link" />
          {{ $t('proposal.postVoteModal.subscribe') }}
        </BaseButton>

        <div v-if="props.waitingForSigners">
          <BaseLink
            :link="`https://gnosis-safe.io/app/eth:${web3Account}/transactions/queue`"
            hide-external-icon
          >
            <BaseButton tabindex="-1" class="w-full">
              <div class="flex flex-grow items-center justify-center gap-1">
                {{ $t('proposal.postVoteModal.seeQueue') }}
                <i-ho-external-link class="text-sm" />
              </div>
            </BaseButton>
          </BaseLink>
        </div>

        <BaseButton
          primary
          class="!h-[42px] w-full"
          data-testid="post-vote-modal-close"
          @click="emit('close')"
        >
          {{ $t('close') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
