<script setup lang="ts">
defineProps<{
  shouldUseOsnap: boolean;
  legacyOsnap: { enabled: boolean };
}>();

defineEmits<{
  (event: 'toggleShouldUseOsnap'): void;
}>();
</script>

<template>
  <div class="mb-4">
    <div v-if="legacyOsnap.enabled">
      <h6>Warning</h6>
      <p class="mb-3">
        The new oSnap plugin is not compatible with the legacy safeSnap plugin.
        Please remove the safeSnap plugin in your space settings to enable
        oSnap.
      </p>
    </div>
    <div v-else>
      <h6>oSnap Proposal</h6>
      <p class="mb-4">
        Are you planning for this proposal to initiate a transaction that your
        organizations Safe will execute if approved? (Remember, oSnap enables
        trustless and permissionless execution)
      </p>
      <input
        id="toggleOsnap"
        type="checkbox"
        :checked="shouldUseOsnap"
        :disabled="legacyOsnap.enabled"
        @change="$emit('toggleShouldUseOsnap')"
      />
      <label for="toggleOsnap">
        Yes, use oSnap for transactions (this will restrict voting type to
        Basic).
      </label>
    </div>
  </div>
</template>
