<script lang="ts" setup>
import { ExtendedSpace, Proposal, Vote, Profile } from '@/helpers/interfaces';
import { useIntl } from '@/composables';
import { shorten } from '@/helpers/utils';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  vote: Vote;
  profiles: Record<string, Profile>;
  titles: Record<string, any>;
}>();

defineEmits(['openReceiptModal']);

const { formatCompactNumber } = useIntl();
</script>

<template>
  <div class="flex items-center border-t px-3 py-[14px]">
    <BaseUser
      :key="vote.voter"
      :profile="profiles[vote.voter]"
      :address="vote.voter"
      :space="space"
      :proposal="proposal"
      width-class="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px] text-left"
    />

    <SpaceProposalVotesListItemChoice :proposal="proposal" :vote="vote" />
    <div
      class="flex w-[110px] min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:w-[130px] xs:min-w-[130px]"
    >
      <span
        v-tippy="{
          content: vote.scores
            ?.map(
              (score, index) => `${formatCompactNumber(score)} ${titles[index]}`
            )
            .join(' + ')
        }"
      >
        {{
          `${formatCompactNumber(vote.balance)} ${shorten(
            proposal.symbol || space.symbol,
            'symbol'
          )}`
        }}
      </span>
      <BaseButtonIcon @click="$emit('openReceiptModal', vote.ipfs)">
        <BaseIcon name="signature" />
      </BaseButtonIcon>
      <BaseButtonIcon
        v-if="vote.reason !== '' && props.proposal.privacy !== 'shutter'"
        v-tippy="{
          content: vote.reason
        }"
        class="cursor-default p-0"
      >
        <i-ho-annotation class="text-[16px]" />
      </BaseButtonIcon>
    </div>
  </div>
</template>
