<script setup lang="ts">
import { useClient } from '@/composables';

const { isGnosisSafe } = useClient();

defineProps<{
  currentStep: number;
}>();

const emit = defineEmits(['changeStep']);

const steps = [
  { name: 'Getting started' },
  { name: 'ENS' },
  { name: 'Controller' },
  { name: 'Profile' },
  { name: 'Strategy' },
  { name: isGnosisSafe.value ? 'Extras' : 'Moderation' }
];
</script>

<template>
  <div>
    <nav class="flex" aria-label="Progress">
      <ol role="list" class="space-y-4 pt-3">
        <li v-for="(step, i) in steps" :key="step.name">
          <div v-if="currentStep > i">
            <span class="flex items-center">
              <span
                class="relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary"
              >
                <i-ho-check class="text-[14px] text-white" aria-hidden="true" />
                <span
                  v-if="i > 0"
                  class="absolute -top-4 h-4 w-[1px] bg-primary"
                />
              </span>

              <button
                class="ml-3 text-base font-medium text-skin-text"
                @click="emit('changeStep', i)"
              >
                {{ step.name }}
              </button>
            </span>
          </div>
          <div
            v-else-if="currentStep === i"
            class="flex items-center"
            aria-current="step"
          >
            <span
              class="relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border !border-primary"
              aria-hidden="true"
            >
              <span class="absolute h-4 w-4 rounded-full" />
              <span class="relative block h-2 w-2 rounded-full bg-primary" />
              <span
                v-if="i > 0"
                class="absolute -top-[25px] h-4 w-[1px] bg-primary"
              />
            </span>
            <span class="ml-3 text-base font-medium text-skin-link">
              {{ step.name }}
            </span>
          </div>
          <div v-else class="flex items-center">
            <div
              class="relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <span
                v-if="i > 0"
                class="absolute -top-[25px] h-4 w-[1px] bg-skin-border"
              />
            </div>
            <span class="ml-3 text-base font-medium text-skin-text">
              {{ step.name }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  </div>
</template>
