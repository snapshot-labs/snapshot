<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useOnboardingChecklist } from '@/composables/useOnboardingChecklist';
import { lsSet, lsGet } from '@/helpers/utils';

const { t } = useI18n();

const { onboardingChecklist } = useOnboardingChecklist();

const showOnboarding = ref(true);

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

if (lsGet('timelineOnboarding') == 'hidden') {
  showOnboarding.value = false;
}

watch(checkListCompleted, completed => {
  if (completed) lsSet('timelineOnboarding', 'hidden');
});

function closeOnboarding() {
  lsSet('timelineOnboarding', 'hidden');
  showOnboarding.value = false;
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="showOnboarding"
      class="border-skin-border bg-skin-block-bg text-white md:rounded-lg md:border"
    >
      <div class="p-4">
        <div class="flex">
          <div class="flex-grow">
            <h3 class="text-bold">{{ t('onboarding.title') }}</h3>
            <p>{{ t('onboarding.subtitle') }}</p>
          </div>
          <div class="mt-2">
            <button
              class="opacity-50 transition-opacity hover:opacity-100"
              :aria-label="t('onboarding.close')"
              @click="closeOnboarding"
            >
              <svg class="h-[24px] w-[24px]" fill="none" viewBox="0 0 12 12">
                <path
                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
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
