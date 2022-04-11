<script setup lang="ts">
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

defineProps<{ activity: ProfileActivity }>();
</script>

<template>
  <div>
    <!-- Vote activity item -->
    <router-link
      :to="{
        name: 'spaceProposal',
        params: { key: activity.space.id, id: activity.proposal.id }
      }"
    >
      <BaseBlock class="hover:border-skin-text cursor-pointer">
        <div class="flex">
          <AvatarSpace size="44" :space="activity.space" />
          <div class="w-full ml-3">
            <div>
              {{ activity.proposal.title }}
            </div>
          </div>
        </div>
      </BaseBlock>
    </router-link>
    <!-- Other activity items -->
  </div>
</template>
