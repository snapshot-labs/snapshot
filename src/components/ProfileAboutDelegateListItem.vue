<script setup lang="ts">
defineProps<{
  spaces: Record<string, any>;
  delegatorsFilteredBySpaces: string[];
  delegators: { delegator: string; space: string }[];
  userAddress: string;
  web3Account: string;
}>();
</script>

<template>
  <div>
    <div
      v-for="space in delegatorsFilteredBySpaces"
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

        <div
          v-if="
            delegators.find(
              d =>
                d.delegator === web3Account.toLowerCase() && d.space === space
            )
          "
          class="flex items-center space-x-2 rounded-full px-4 border h-[44px]"
        >
          <i-ho-check />
          <div>{{ $t('profile.about.delegated') }}</div>
        </div>

        <BaseButton
          v-else-if="userAddress !== web3Account"
          @click="$emit('delegate', space)"
          class="!h-[44px]"
          primary
        >
          {{ $t('profile.about.delegate') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
