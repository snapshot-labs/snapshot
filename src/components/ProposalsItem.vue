<script setup lang="ts">
import removeMd from 'remove-markdown';
import { Proposal, ExtendedSpace, Profile } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: Profile };
  space: ExtendedSpace;
  voted: boolean;
  to: Record<string, unknown>;
  hideSpaceAvatar?: boolean;
  showVerifiedIcon?: boolean;
}>();

const { isMessageVisible, setMessageVisibility } = useFlaggedMessageStatus(
  props.proposal.id
);

const body = computed(() => removeMd(props.proposal.body));

onMounted(() => setMessageVisibility(props.proposal.flagged));
</script>

<template>
  <div>
    <div class="block p-3 text-skin-text sm:p-4">
      <div>
        <MessageWarningFlagged
          v-if="isMessageVisible"
          type="proposal"
          @forceShow="setMessageVisibility(false)"
        />
        <template v-else>
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-start gap-1 space-x-1">
              <template v-if="!hideSpaceAvatar">
                <LinkSpace class="text-skin-text" :space-id="proposal.space.id">
                  <div class="flex items-center">
                    <AvatarSpace :space="proposal.space" size="28" />
                    <span
                      class="ml-2 text-skin-link"
                      v-text="proposal.space.name"
                    />
                    <IconVerifiedSpace
                      v-if="showVerifiedIcon && space.verified"
                      class="pl-[2px]"
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

          <router-link :to="to">
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
        </template>
      </div>
    </div>
  </div>
</template>
