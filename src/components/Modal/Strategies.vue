<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Strategies</h3>
    <div
      v-for="(strategy, i) in strategies"
      :key="i"
      class="m-4 mt-0 p-4 border rounded-2 text-white"
    >
      <h3 v-text="strategy[0]" />
      <div>
        <div v-for="(option, key) in strategy[1]" :key="key" class="d-flex">
          <span v-text="key" class="flex-auto text-gray mr-1" />
          <a
            v-if="key === 'address'"
            :href="_explorer(space.chainId, option)"
            target="_blank"
            class="d-block"
          >
            <span v-text="_shorten(option)" />
            <Icon name="external-link" class="ml-1" />
          </a>
          <span
            v-else
            v-text="
              ['string', 'number', 'boolean'].includes(typeof option)
                ? option
                : typeof option
            "
          />
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'strategies', 'space']
};
</script>
