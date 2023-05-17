<script setup lang="ts">
import { Space } from '@/helpers/interfaces';

defineProps<{
  spaces: Space[];
  delegators: { delegator: string; space: string }[];
  userAddress: string;
  web3Account: string;
}>();

defineEmits(['delegate']);
</script>

<template>
  <div>
    <div
      v-for="space in spaces"
      :key="space.id"
      class="border-b px-4 py-2 first:border-t last:border-b-0"
    >
      <div class="flex justify-between">
        <router-link
          class="flex items-center"
          :to="{ name: 'spaceProposals', params: { key: space.id } }"
        >
          <AvatarSpace :space="space" size="35" />
          <div class="flex items-center">
            <h4 class="ml-3">
              {{ space.name }}
            </h4>
            <IconVerifiedSpace
              v-if="space.verified"
              size="19"
              class="ml-1 flex text-primary"
            />
          </div>
        </router-link>

        <div
          v-if="
            delegators.find(
              d =>
                d.delegator === web3Account.toLowerCase() &&
                d.space === space.id
            )
          "
          class="flex h-[44px] items-center space-x-2 rounded-full border px-4"
        >
          <i-ho-check />
          <div>{{ $t('profile.about.delegated') }}</div>
        </div>

        <BaseButton
          v-else-if="userAddress !== web3Account"
          class="!h-[44px]"
          primary
          @click="$emit('delegate', space)"
        >
          {{ $t('profile.about.delegate') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
