<script setup lang="ts">
defineProps<{
  activity: {
    id: number;
    created: number;
    type: string;
    account: string;
    payload: {
      __typename: string;
      title?: string;
      choice?: string;
      space: {
        id: number;
        name: string;
        avatar: string;
      };
    };
  };
}>();
</script>

<template>
  <BaseBlock class="hover:border-skin-text cursor-pointer">
    <div>{{ activity?.type === 'voted' ? 'Voted' : 'Proposed' }}</div>
    <AvatarSpace :space="activity.payload.space" />
  </BaseBlock>
</template>
