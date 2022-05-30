<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

defineProps<{
  space: {
    id: string;
    name: string;
    avatar?: string;
    followers?: number;
  };
}>();
</script>

<template>
  <router-link :to="{ name: 'spaceProposals', params: { key: space.id } }">
    <BaseBlock class="">
      <div class="flex justify-between">
        <div class="flex min-w-0">
          <AvatarSpace :space="space" :size="44" />
          <div class="ml-3 truncate mr-3">
            <div class="flex items-center">
              <div class="truncate">
                {{ space.name }}
              </div>
              <IconVerifiedSpace
                class="flex text-primary ml-1"
                :spaceId="space.id"
                size="18"
              />
            </div>
            <div class="text-xs text-skin-text leading-5">
              {{
                $tc('members', space.followers, {
                  count: formatCompactNumber(space.followers)
                })
              }}
            </div>
          </div>
        </div>
        <ButtonFollow class="!mb-0 !w-[100px] !h-[44px]" :space="space" />
      </div>
    </BaseBlock>
  </router-link>
</template>
