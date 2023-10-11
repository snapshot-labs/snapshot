<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace | undefined;
  legacyOsnap: { selection: boolean };
}>();

defineEmits<{
  (event: 'legacyOsnapToggle'): void;
}>();
</script>

<template>
  <div class="mb-4">
    <div v-if="space?.voting?.type && space.voting.type !== 'basic'">
      <h6>Where is oSnap?</h6>
      <p class="mb-3">
        oSnap is currently disabled because your space's voting settings
        disallow the basic voting type which is a requirement for oSnap to work
        properly.
      </p>
      <p>
        Have your admin visit your
        <a :href="`#/${space.id}/settings`">settings page</a> under Voting ->
        Type, and make sure either "Any" or "Basic Voting" is selected. This
        will allow you to create oSnap proposals.
      </p>
    </div>
    <div v-else>
      <h6>oSnap Proposal</h6>
      <p>
        Are you planning for this proposal to initiate a transaction that your
        organizations Safe will execute if approved? (Remember, oSnap enables
        trustless and permissionless execution)
      </p>
      <br />
      <input
        id="toggleOsnap"
        type="checkbox"
        :checked="legacyOsnap.selection"
        @change="$emit('legacyOsnapToggle')"
      />
      <label for="toggleOsnap">
        Yes, use oSnap for transactions (this will restrict voting type to
        Basic).
      </label>
    </div>
  </div>
</template>
