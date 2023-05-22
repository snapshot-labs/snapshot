<script setup lang="ts">
import { useTippy } from 'vue-tippy';
import { useStorage } from '@vueuse/core';
import {
  DelegateWithPercent,
  ExtendedSpace,
  Profile
} from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  profiles: Record<string, Profile>;
  accountDelegate: DelegateWithPercent;
}>();

const { web3Account } = useWeb3();
const { formatCompactNumber } = useIntl();

const loggedAvatar = ref();
const showOnboarding = useStorage('snapshot.showOnboardingDelegates', true);

const loggedAvatarTooltip = useTippy(loggedAvatar, {
  content: 'Delegation profile',
  placement: 'top-end',
  trigger: 'manual',
  showOnCreate: showOnboarding.value,
  onHide: () => {
    showOnboarding.value = false;
  }
});
</script>

<template>
  <BasePopoverHover v-if="web3Account">
    <template #button>
      <div ref="loggedAvatar" @mouseenter="loggedAvatarTooltip.hide()">
        <AvatarUser :address="web3Account" size="42" class="cursor-pointer" />
      </div>
    </template>
    <template #content>
      <div class="p-4">
        <div class="flex">
          <div>
            <AvatarUser :address="web3Account" size="69" />
          </div>
          <div>
            <ProfileName
              :profile="profiles[web3Account]"
              :address="web3Account"
            />
            <div class="flex gap-3 pl-3 text-skin-text">
              <div>
                {{
                  formatCompactNumber(Number(accountDelegate.delegatedVotes))
                }}
                {{ space.symbol }}
              </div>
              <div>
                {{
                  formatCompactNumber(
                    Number(accountDelegate.tokenHoldersRepresentedAmount)
                  )
                }}
                delegators
              </div>
            </div>
          </div>
        </div>
        <p class="mt-4">
          <span class="line-clamp-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate
            sit rerum corrupti odit et quos facere saepe tempore ipsam facilis,
            doloremque ex ratione repellat cum repudiandae, quis consectetur
            distinctio deleniti!
          </span>
          <button class="flex cursor-pointer items-center gap-1 text-skin-link">
            Edit statement
          </button>
        </p>
      </div>
    </template>
  </BasePopoverHover>
</template>
