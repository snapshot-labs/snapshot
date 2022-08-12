<script setup lang="ts">
import { computed } from 'vue';
import removeMd from 'remove-markdown';
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: { ens: string; name?: string; about?: string } };
  voted: boolean;
}>();

const body = computed(() => removeMd(props.proposal.body));
</script>

<template>
  <div class="border-skin-border transition-colors last:border-b-0 md:border-b">
    <router-link
      class="block p-4 text-skin-text"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="flex justify-between">
          <div class="mb-2 flex items-center space-x-1">
            <router-link
              class="group text-skin-text"
              :to="{
                name: 'spaceProposals',
                params: { key: proposal.space.id }
              }"
            >
              <div class="flex items-center">
                <AvatarSpace :space="proposal.space" size="28" />
                <span
                  class="ml-2 group-hover:text-skin-link"
                  v-text="proposal.space.name"
                />
              </div>
            </router-link>
            <span v-text="$tc('proposalBy')" />
            <BaseUser
              :address="proposal.author"
              :profile="profiles[proposal.author]"
              :proposal="proposal"
              :space="proposal.space"
              hide-avatar
            />
          </div>
          <LabelProposalState :state="proposal.state" />
        </div>
        <ProposalsItemTitle :proposal="proposal" :voted="voted" />

        <ProposalsItemBody v-if="body">
          {{ body }}
        </ProposalsItemBody>

        <ProposalsItemResults
          v-if="
            proposal.scores_state === 'final' &&
            proposal.scores_total > 0 &&
            proposal.choices.length <= 6
          "
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
