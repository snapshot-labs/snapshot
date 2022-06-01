<script setup lang="ts">
import { computed } from 'vue';
interface ProfileActivity {
  id: string;
  created: number;
  type: string;
  title: string;
  space: { id: string; avatar: string };
  vote?: { proposalId: string; choice: string; type: string };
}

const props = defineProps<{ activity: ProfileActivity }>();

const showChoice = computed(() => {
  // true if proposal type is 'basic' or 'single-choice'
  return ['basic', 'single-choice'].includes(props.activity.vote?.type ?? '');
});
</script>

<template>
  <div class="border-b border-skin-text last:border-b-0">
    <!-- Vote activities -->
    <router-link
      v-if="activity.type === 'vote'"
      :to="{
        name: 'spaceProposal',
        params: { key: activity.space.id, id: activity.vote?.proposalId }
      }"
    >
      <div class="flex w-full py-4 px-4">
        <div class="relative min-w-[52px]">
          <AvatarSpace :size="44" :space="activity.space" />
          <div
            class="absolute text-[9px] right-0 top-[24px] bg-primary rounded-full p-[6px] pr-[5px] text-white"
          >
            <i-s-signature />
          </div>
        </div>
        <div class="w-[calc(100%-64px)] ml-4">
          <div class="text-xs text-skin-text leading-5">
            {{
              $t('profile.activity.votedFor', {
                choice: showChoice ? `"${activity.vote?.choice}"` : ''
              })
            }}
          </div>
          <div class="truncate pr-2">
            {{ activity.title }}
          </div>
        </div>
      </div>
    </router-link>
    <!-- Other activities -->
  </div>
</template>
