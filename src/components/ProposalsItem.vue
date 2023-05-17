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

const forceShow = ref(false);

const body = computed(() => removeMd(props.proposal.body));

const isHidden = computed(() => {
  if (forceShow.value) return false;
  if (props.proposal.flagged) return true;
  return false;
});
</script>

<template>
  <div>
    <div class="block p-3 text-skin-text sm:p-4">
      <div>
        <div v-if="!isHidden" class="mb-2 flex items-center justify-between">
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
        <div v-if="isHidden" class="flex rounded-xl border py-3 pl-4">
          <div>
            {{ $t('warningFlagged') }}
          </div>
          <div class="flex items-center">
            <button @click.prevent="forceShow = true">
              <div class="px-4 py-3 hover:text-skin-link">Show</div>
            </button>
          </div>
        </div>
        <template v-else>
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
