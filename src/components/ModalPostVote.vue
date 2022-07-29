<script setup lang="ts">
import { computed } from 'vue';
import { useClient, useSharing } from '@/composables';
import { getChoiceString } from '@/helpers/utils';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const { isGnosisSafe } = useClient();
const { shareVote } = useSharing();

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
    getChoiceString(props.proposal, props.selectedChoices),
    window
  );
}
</script>

<template>
  <BaseModal :open="open" max-height="550px" @close="emit('close')">
    <div class="flex h-screen flex-col justify-between p-4 md:h-auto">
      <div>
        <img
          :src="imgPath"
          class="mx-auto mt-5 h-[220px] sm:h-[300px] md:h-[220px]"
          alt="hooray sticker"
        />
        <div class="mt-4 text-center">
          <template v-if="isGnosisSafe">
            <h3>Your vote is pending...</h3>
            <p class="italic">
              Votes with a Safe require additional signers and will be visible
              once the transaction is confirmed
            </p>
          </template>
          <template v-else>
            <h3>Your vote is in!</h3>
            <p class="italic">
              Votes can be changed while the proposal is active
            </p>
          </template>
        </div>
      </div>

      <div class="mt-6 space-y-2">
        <BaseButton
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
    </div>
  </BaseModal>
</template>
