<script setup lang="ts">
import { computed } from 'vue';
import removeMd from 'remove-markdown';
import { Proposal, ExtendedSpace, Profile } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: Profile };
  space: ExtendedSpace;
  voted: boolean;
  to: Record<string, unknown>;
  hideSpaceAvatar?: boolean;
}>();

const body = computed(() => removeMd(props.proposal.body));
</script>

<template>
  <div>
    <router-link class="block p-3 text-skin-text sm:p-4" :to="to">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center space-x-1">
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

        <ProposalsItemTitle :proposal="proposal" :voted="voted" />

        <ProposalsItemBody v-if="body">
          {{ body }}
        </ProposalsItemBody>

        <ProposalsItemResults
          v-if="proposal.scores_state === 'final' && proposal.scores_total > 0"
          :proposal="proposal"
        />

        <ProposalsItemActive
          v-if="proposal.scores_state !== 'final'"
          :proposal="proposal"
        />
      </div>
    </router-link>
  </div>
</template>
