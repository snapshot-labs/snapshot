<script setup lang="ts">
const { progress, Status } = useNFTClaimerProgress();

const length = computed(() => {
  return Object.keys(progress).length;
});

function nextStepStatus(step: number) {
  const steps = Object.keys(progress.value);
  if (step + 1 > steps.length - 1) {
    return false;
  }
  console.log(progress.value[steps[step]].status);
  return progress.value[steps[step + 1]].status;
}
</script>

<template>
  <nav class="flex" aria-label="Progress">
    <ol role="list" class="space-y-4 pt-3">
      <li v-for="(step, key, i) in progress" :key="key">
        <div>
          <span class="flex">
            <div class="relative flex justify-center">
              <span
                :class="{
                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full': true,
                  'border-primary bg-primary': step.status === Status.SUCCESS,
                  'bg-red': step.status === Status.ERROR,
                  border: step.status === Status.FUTURE
                }"
              >
                <i-ho-check
                  v-if="step.status === Status.SUCCESS"
                  class="text-[12px] text-white"
                  aria-hidden="true"
                />
                <LoadingSpinner
                  v-else-if="step.status === Status.WORKING"
                  :big="true"
                />
                <i-ho-x
                  v-else-if="step.status === Status.ERROR"
                  class="text-[12px] text-white"
                  aria-hidden="true"
                />
              </span>
              <span
                v-if="i < length - 2"
                :class="{
                  'absolute top-4 h-full w-[1px] bg-skin-border': true,
                  '!bg-primary': nextStepStatus(i) === Status.SUCCESS,
                  '!bg-red': nextStepStatus(i) === Status.ERROR
                }"
              />
            </div>
            <div
              :class="{
                'ml-3 flex flex-col text-base': true,
                'opacity-30': step.status === Status.FUTURE,
                'text-red': step.status === Status.ERROR
              }"
            >
              <span
                :class="{
                  'font-semibold': true,
                  'text-red': step.status === Status.ERROR,
                  'text-skin-link': step.status !== Status.ERROR
                }"
              >
                {{ step.name }}
              </span>
              <span
                :class="
                  step.status === Status.ERROR ? 'text-red' : 'text-slate-500'
                "
                v-html="step.description"
              >
              </span>
            </div>
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>
