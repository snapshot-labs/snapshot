<script setup lang="ts">
defineProps<{
  progress: Record<
    string,
    { name: string; description: string; status: string }
  >;
}>();
</script>

<template>
  <nav class="flex" aria-label="Progress">
    <ol role="list" class="space-y-4 pt-3">
      <li v-for="(step, key, i) in progress" :key="key">
        <div>
          <span class="flex">
            <span
              v-if="step.status === 'SUCCESS'"
              class="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary"
            >
              <i-ho-check class="text-[12px] text-white" aria-hidden="true" />
              <span
                v-if="i > 0"
                class="absolute -top-[48px] h-[48px] w-[1px] bg-primary"
              />
            </span>
            <span
              v-else-if="step.status === 'WORKING'"
              class="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <LoadingSpinner :big="true" />
              <span
                v-if="i > 0"
                class="absolute -top-[48px] h-[48px] w-[1px] bg-primary"
              />
            </span>
            <span
              v-else-if="step.status === 'ERROR'"
              class="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red"
              aria-hidden="true"
            >
              <i-ho-x class="text-[12px] text-white" aria-hidden="true" />
              <span
                v-if="i > 0"
                class="absolute -top-[48px] h-[48px] w-[1px] bg-red"
              />
            </span>

            <div
              v-else
              class="relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <span
                v-if="
                  i > 0 && Object.values(progress)[i - 1].status !== 'FUTURE'
                "
                class="absolute -top-[48px] h-[48px] w-[1px] w-[1px] bg-skin-border"
              />
              <span
                v-else-if="i > 0"
                class="absolute -top-4 h-4 w-[1px] w-[1px] bg-skin-border"
              />
            </div>

            <div
              :class="{
                'ml-3 flex flex-col text-base': true,
                'opacity-60': step.status === 'FUTURE',
                'text-red': step.status === 'ERROR'
              }"
            >
              <span
                :class="{
                  'font-medium': true,
                  'text-red': step.status === 'ERROR',
                  'text-skin-link': step.status !== 'ERROR'
                }"
              >
                {{ step.name }}
              </span>
              <span
                :class="step.status === 'ERROR' ? 'text-red' : 'text-slate-500'"
              >
                {{ step.description }}
              </span>
            </div>
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>
