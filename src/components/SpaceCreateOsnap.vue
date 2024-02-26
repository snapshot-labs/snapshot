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
  <div
    class="mb-4 border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border p-4"
  >
    <div v-if="legacyOsnap.enabled">
      <h6>oSnap Warning</h6>
      <p class="mb-3">
        You currently have both the oSnap plugin and the SafeSnap plugin
        installed in your space. You can continue using oSnap with SafeSnap
        without any changes to your space. If you would like to use the oSnap
        plugin instead, please see the
        <a
          target="_blank"
          href="https://docs.uma.xyz/developers/osnap/osnap-configuration-parameters-1"
          >oSnap plugin migration docs.</a
        >
        Otherwise please remove the oSnap plugin from your space settings for
        the best experience with SafeSnap.
      </p>
    </div>
    <div v-else>
      <h6>oSnap Proposal</h6>
      <p class="mb-4">
        Are you planning for this proposal to initiate a transaction that your
        organizations Safe will execute if approved? (Remember, oSnap enables
        trustless and permissionless execution)
      </p>
      <TuneSwitch
        :model-value="shouldUseOsnap"
        label="Yes, use oSnap for transactions (this will restrict voting type to Basic)."
        :disabled="legacyOsnap.enabled"
        @update:model-value="$emit('toggleShouldUseOsnap')"
      />
    </div>
  </div>
</template>
