<script setup lang="ts">
import removeMd from 'remove-markdown';
import { Proposal, ExtendedSpace, Profile } from '@/helpers/interfaces';
import { BoostSubgraph } from '@/helpers/boost/types';

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: Profile };
  space: ExtendedSpace;
  voted: boolean;
  to: Record<string, unknown>;
  hideSpaceAvatar?: boolean;
  showVerifiedIcon?: boolean;
  boosts?: BoostSubgraph[];
}>();

const { isMessageVisible, setMessageVisibility } = useFlaggedMessageStatus(
  props.proposal.id
);

const body = computed(() => removeMd(props.proposal.body));

const boostsCount = computed(() => {
  if (!props.boosts) return 0;
  return props.boosts.filter(
    boost => boost.strategy.proposal === props.proposal.id
  ).length;
});

onMounted(() => setMessageVisibility(props.proposal.flagged));
</script>

<template>
  <div>
    <div class="block p-3 text-skin-text sm:p-4">
      <div>
        <MessageWarningFlagged
          v-if="isMessageVisible"
          type="proposal"
          @force-show="setMessageVisibility(false)"
        />
        <template v-else>
          <div class="flex h-[26px] items-start justify-between">
            <div class="flex items-center gap-1">
              <template v-if="!hideSpaceAvatar">
                <LinkSpace class="text-skin-text" :space-id="proposal.space.id">
                  <div class="flex items-center">
                    <AvatarSpace :space="proposal.space" size="20" />
                    <span
                      class="ml-1 text-skin-link"
                      v-text="proposal.space.name"
                    />
                    <IconVerifiedSpace
                      v-if="showVerifiedIcon && space.verified"
                      :turbo="space.turbo"
                      class="mt-[2px] pl-[2px]"
                      size="18"
                    />
                  </div>
                </LinkSpace>
                <span v-text="$tc('proposalBy')" />
              </template>
              <BaseUser
                :address="proposal.author"
                :profile="profiles[proposal.author]"
                :space="space"
                :proposal="proposal"
                :hide-avatar="!hideSpaceAvatar"
              />
            </div>
            <LabelProposalState :state="proposal.state" />
          </div>

          <router-link :to="to" class="cursor-pointer">
            <ProposalsItemTitle :proposal="proposal" :voted="voted" />

            <ProposalsItemBody v-if="body">
              {{ body }}
            </ProposalsItemBody>

            <ProposalsItemResults
              v-if="
                proposal.scores_state === 'final' && proposal.scores_total > 0
              "
              :proposal="proposal"
            />
          </router-link>

          <ProposalsItemFooter :proposal="proposal" />
          <div
            v-if="boostsCount > 0"
            class="border px-[12px] py-2 rounded-xl flex items-center justify-center gap-1 mt-2"
            :class="{
              'bg-green/5 border-green/20 text-green':
                proposal.state === 'closed',
              'bg-boost/5 border-boost/20 text-boost':
                proposal.state === 'active'
            }"
          >
            <i-ho-fire v-if="proposal.state === 'active'" class="text-sm" />
            <i-ho-cash
              v-else-if="proposal.state === 'closed'"
              class="text-sm"
            />
            {{ boostsCount }}
            <div>boost<span v-if="boostsCount > 1">s</span></div>
            <span v-if="proposal.state === 'active'">active</span>
            <span v-else-if="proposal.state === 'closed'">claimable</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
