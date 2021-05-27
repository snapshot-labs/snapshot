<template>
  <a
    v-if="proposal.plugins?.aragon?.[`choice${[i + 1]}`]"
    @click="$emit('open')"
    :aria-label="`Target address: ${
      proposal.plugins.aragon[`choice${i + 1}`].actions[0].to
    }\nValue: ${
      proposal.plugins.aragon[`choice${i + 1}`].actions[0].value
    }\nData: ${proposal.plugins.aragon[`choice${i + 1}`].actions[0].data}`"
    class="tooltipped tooltipped-n break-word"
  >
    <Icon name="warning" class="v-align-middle ml-1" />
  </a>
</template>

<script>
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    }
  }
};
</script>
