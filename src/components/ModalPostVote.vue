<script setup lang="ts">
import { getChoiceString } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import { getSafeAppLink } from '@/plugins/oSnap/utils';

const { shareVote, shareProposalX, shareProposalHey } = useSharing();
const { web3, web3Account } = useWeb3();
const { userState, loadEmailSubscriptions, initialized } =
  useEmailSubscription();

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

function share(shareTo: 'x' | 'hey') {
  shareVote(shareTo, {
    space: props.space,
    proposal: props.proposal,
    choices: getChoiceString(props.proposal, props.selectedChoices)
  });
}

onMounted(() => {
  if (!initialized.value) {
    loadEmailSubscriptions();
  }
});
</script>

<template>
  <TuneModal :open="open" max-height="550px" @close="emit('close')">
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
            <p>Thank you for your participation!</p>
            <p>Votes can be changed while the proposal is active.</p>
          </template>
        </div>
      </div>
    </div>

    <div class="space-y-2 p-3">
      <TuneButton
        class="flex !h-[42px] w-full items-center justify-center gap-2"
        @click="
          props.waitingForSigners ? shareProposalX(space, proposal) : share('x')
        "
      >
        <i-s-x class="text-md" />
        Share on X
      </TuneButton>
      <TuneButton
        class="flex !h-[42px] w-full items-center justify-center gap-2"
        @click="
          props.waitingForSigners
            ? shareProposalHey(space, proposal)
            : share('hey')
        "
      >
        <i-s-hey class="text-[#FB3A5D]" />
        {{ $t('shareOnHey') }}
      </TuneButton>

      <TuneButton
        v-if="userState !== 'VERIFIED' && initialized"
        class="flex !h-[42px] w-full items-center justify-center gap-2"
        @click="subscribeEmail"
      >
        <i-ho-mail class="text-skin-link" />
        {{ $t('proposal.postVoteModal.subscribe') }}
      </TuneButton>
      <div v-if="props.waitingForSigners">
        <BaseLink
          :link="
            getSafeAppLink(web3.network.chainId, web3Account, {
              path: 'transactions/queue'
            })
          "
          hide-external-icon
        >
          <TuneButton tabindex="-1" class="w-full">
            <div class="flex flex-grow items-center justify-center gap-1">
              {{ $t('proposal.postVoteModal.seeQueue') }}
              <i-ho-external-link class="text-sm" />
            </div>
          </TuneButton>
        </BaseLink>
      </div>

      <TuneButton
        primary
        class="!h-[42px] w-full"
        data-testid="post-vote-modal-close"
        @click="emit('close')"
      >
        {{ $t('close') }}
      </TuneButton>
    </div>
  </TuneModal>
</template>
