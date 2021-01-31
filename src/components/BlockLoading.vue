<template>
  <div v-if="type === 'results'">
    <div v-for="n in 2" :key="n" class="mb-4 d-block">
      <div class="d-flex flex-justify-between mb-2">
        <div
          class="bg-gray-4 rounded-1 anim-pulse"
          style="width: 30%; height: 12px;"
        />
        <div
          class="bg-gray-4 rounded-1 anim-pulse"
          style="width: 15%; height: 12px;"
        />
      </div>

      <div
        class="bg-gray-4 rounded-1 anim-pulse"
        style="widht: 100%; height: 7px;"
      />
    </div>
  </div>
  <div v-if="type === 'votes'" class="px-4 pt-4">
    <div v-for="n in 3" :key="n" class="mb-4 d-block">
      <div class="d-flex flex-justify-between">
        <div
          class="bg-gray-4 rounded-1 anim-pulse"
          style="width: 20%; height: 12px;"
        />
        <div
          class="bg-gray-4 rounded-1 anim-pulse"
          style="width: 20%; height: 12px;"
        />
        <div
          class="bg-gray-4 rounded-1 anim-pulse"
          style="width: 20%; height: 12px;"
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
