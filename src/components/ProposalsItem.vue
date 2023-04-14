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

const body = computed(() => removeMd(props.proposal.body));
</script>

<template>
  <div>
    <router-link class="block p-3 text-skin-text sm:p-4" :to="to">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-start gap-1 space-x-1">
            <template v-if="!hideSpaceAvatar">
              <LinkSpace
                class="text-skin-text"
                :space-id="proposal.space.id"
                @click.stop
              >
                <div class="flex items-center">
                  <AvatarSpace :space="proposal.space" size="28" />
                  <span
                    class="ml-2 text-skin-link"
                    v-text="proposal.space.name"
                  />
                  <IconVerifiedSpace
                    v-if="showVerifiedIcon"
                    :space-id="space.id"
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
            <i-ho-exclamation-circle
              v-if="proposal.flagged"
              v-tippy="{
                content: $t('warningFlagged')
              }"
              class="cursor-help text-red"
            />
          </div>
          <LabelProposalState :state="proposal.state" />
        </div>

        <ProposalsItemTitle :proposal="proposal" :voted="voted" />

        <ProposalsItemBody v-if="body">
          {{ body }}
        </ProposalsItemBody>

        <ProposalsItemResults
          v-if="proposal.scores_state === 'final' && proposal.scores_total > 0"
          :proposal="proposal"
        />

        <ProposalsItemFooter :proposal="proposal" />
      </div>
    </router-link>
  </div>
</template>
