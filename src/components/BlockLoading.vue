<template>
  <div v-if="type === 'results'">
    <div v-for="n in 2" :key="n" class="mb-4 d-block">
      <div class="d-flex flex-justify-between mb-2">
        <div
          class="rounded-1 anim-pulse bg-gray-9"
          style="width: 30%; height: 14px"
        />
        <div
          class="rounded-1 anim-pulse bg-gray-9"
          style="width: 15%; height: 14px"
        />
      </div>

      <div
        class="rounded-1 anim-pulse bg-gray-9"
        style="widht: 100%; height: 9px"
      />
    </div>
  </div>
  <div v-if="type === 'votes'" class="px-4 pt-4">
    <div v-for="n in 3" :key="n" class="mb-5 d-block">
      <div class="d-flex flex-justify-between">
        <div
          class="rounded-1 anim-pulse bg-gray-9"
          style="width: 20%; height: 14px"
        />
        <div
          class="rounded-1 anim-pulse bg-gray-9"
          style="width: 20%; height: 14px"
        />
        <div
          class="rounded-1 anim-pulse bg-gray-9"
          style="width: 20%; height: 14px"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['type']
};
</script>
