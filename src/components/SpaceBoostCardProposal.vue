<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

defineProps<{
  proposal: Proposal;
  space: ExtendedSpace;
}>();
</script>

<template>
  <TuneBlock class="!bg-[--border-color-faint]">
    <RouterLink :to="{ name: 'spaceProposal', params: { id: proposal.id } }">
      <h4 class="leading-5">
        {{ proposal.title }}
      </h4>
      <p class="line-clamp-2 mt-1 text-skin-text">
        {{ proposal.body }}
      </p>
    </RouterLink>
    <div class="flex gap-3 items-center h-[20px] mt-[12px]">
      <LinkSpace
        class="text-skin-text flex items-center"
        :space-id="proposal.space.id"
      >
        <AvatarSpace :space="space" size="20" class="!text-skin-text" />
        <span class="ml-1 text-skin-text" v-text="space.name" />
      </LinkSpace>

      <BaseUser
        :address="proposal.author"
        :space="space"
        text-class="text-skin-text"
      />
    </div>
  </TuneBlock>
</template>
