<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useOnboardingChecklist } from '@/composables/useOnboardingChecklist';
import { useStorage } from '@vueuse/core';

const props = defineProps<{
  web3Account: string;
}>();

const { t } = useI18n();
const { onboardingChecklist } = useOnboardingChecklist();

const hideOnboarding = useStorage(
  `snapshot.hideOnboarding.${props.web3Account.slice(0, 8).toLowerCase()}`,
  false
);

const checkListCompleted = computed(() => {
  let completed = true;

  onboardingChecklist.value.forEach(checkListItem => {
    if (!checkListItem.checked) {
      completed = false;
      return;
    }
  });

  return completed;
});

watch(checkListCompleted, completed => {
  if (completed) {
    setTimeout(() => {
      hideOnboarding.value = true;
    }, 2000);
  }
});

function closeOnboarding() {
  hideOnboarding.value = true;
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="!hideOnboarding"
      class="border-skin-border bg-skin-block-bg text-white md:rounded-lg md:border"
    >
      <div class="p-4">
        <div class="flex">
          <div class="flex-grow">
            <h3 class="text-bold mt-0">
              {{ t('onboarding.title') }}
            </h3>
            <p>{{ t('onboarding.subtitle') }}</p>
          </div>
          <div>
            <BaseButtonIcon @click="closeOnboarding">
              <i-ho-x class="text-base" />
            </BaseButtonIcon>
          </div>
        </div>

        <ul class="mt-4 flex-col space-y-2">
          <li
            v-for="checkListItem in onboardingChecklist"
            :key="checkListItem.name"
            class="flex items-center"
          >
            <div class="w-4">
              <i-ho-check
                v-if="checkListItem.checked"
                class="text-[17px] text-green"
              />
              <div v-else class="h-3 w-3 border"></div>
            </div>
            {{ checkListItem.name }}
          </li>
        </ul>
        <transition name="fade">
          <div v-if="checkListCompleted" class="mt-4">
            <h3>🎉 {{ t('onboarding.congratulations') }}</h3>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>
