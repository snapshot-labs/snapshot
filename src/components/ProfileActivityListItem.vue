<script setup lang="ts">
import { computed } from 'vue';
interface ProfileActivity {
  id: string;
  created: number;
  choice: number | number[];
  proposal: {
    id: number;
    title: string;
    choices: string[];
    type: string;
  };
  space: {
    id: number;
    avatar: string;
  };
}

const props = defineProps<{ activity: ProfileActivity }>();

const showChoice = computed(() => {
  // if proposal type is 'basic' or 'single-choice'
  return ['basic', 'single-choice'].includes(props.activity.proposal.type);
});
</script>

<template>
  <div class="border-b border-skin-text last:border-b-0">
    <router-link
      :to="{
        name: 'spaceProposal',
        params: { key: activity.space.id, id: activity.proposal.id }
      }"
    >
      <div class="flex w-full py-4 px-4">
        <div class="relative">
          <AvatarSpace size="44" :space="activity.space" />
          <div
            class="absolute text-xs -right-2 top-4 bg-primary rounded-full p-[2px]"
          >
            <i-ho-check />
          </div>
        </div>
        <div class="w-[calc(100%-64px)] ml-5">
          <div class="text-xs text-skin-text leading-5">
            {{
              $t('profile.activity.votedFor', {
                choice: showChoice
                  ? `"${activity.proposal.choices[activity.choice - 1]}"`
                  : ''
              })
            }}
          </div>
          <div class="truncate">
            {{ activity.proposal.title }}
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>
