<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const emit = defineEmits(['next', 'back']);

const { form } = useSpaceSettingsForm('setup');
</script>

<template>
  <div>
    <SettingsVotingBlock
      v-model:delay="form.voting.delay"
      v-model:period="form.voting.period"
      v-model:quorum="form.voting.quorum"
      v-model:type="form.voting.type"
      v-model:hideAbstain="form.voting.hideAbstain"
    />
    <div class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="emit('next')" />
    </div>
  </div>
</template>
