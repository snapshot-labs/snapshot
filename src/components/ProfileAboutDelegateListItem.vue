<script setup lang="ts">
defineProps<{
  spaces: Record<string, any>;
  delegatorSpaces: string[];
  userAddress: string;
  web3Account: string;
}>();
</script>

<template>
  <div>
    <div
      v-for="space in delegatorSpaces"
      :key="space"
      class="border-b last:border-b-0 px-4 py-2 first:border-t"
    >
      <div class="flex justify-between">
        <router-link
          class="flex items-center"
          :to="{ name: 'spaceProposals', params: { key: space } }"
        >
          <AvatarSpace :space="spaces[space]" size="35" />
          <div class="flex items-center">
            <h4 class="ml-3">
              {{ spaces[space].name }}
            </h4>
            <IconVerifiedSpace
              :spaceId="space"
              size="19"
              class="text-primary ml-1 flex"
            />
          </div>
        </router-link>
        <BaseButton
          v-if="userAddress !== web3Account"
          @click="$emit('delegate', space)"
          class="!h-[44px]"
        >
          delegate me
        </BaseButton>
      </div>
    </div>
  </div>
</template>
