<script setup>
import { watchEffect, computed, defineProps } from 'vue';
import { useUsername } from '@/composables/useUsername';
import removeMd from 'remove-markdown';

const props = defineProps({
  proposal: Object,
  profiles: Object
});

const body = computed(() => removeMd(props.proposal.body));

const period = computed(() => {
  if (props.proposal.state === 'closed') return 'endedAgo';
  if (props.proposal.state === 'active') return 'endIn';
  return 'startIn';
});

const { address, profile, username } = useUsername();

watchEffect(() => {
  address.value = props.proposal.author;
  profile.value = props.profiles[props.proposal.author];
});
</script>

<template>
  <router-link
    class="p-4 d-block text-color"
    :to="{
      name: 'proposal',
      params: { key: proposal.space.id, id: proposal.id }
    }"
  >
    <div>
      <div class="mb-2">
        <Token :space="proposal.space" size="28" />
        <span class="ml-2" v-text="proposal.space.name" />
        {{ $tc('proposalBy', [username]) }}
        <Badges :address="proposal.author" :members="proposal.space.members" />
        <UiState :state="proposal.state" class="d-inline-block float-right" />
      </div>
      <h3 v-text="_shorten(proposal.title, 124)" class="mt-1" />
      <p
        v-text="_shorten(body, 140)"
        class="break-word mb-1"
        style="font-size: 20px"
      />
      <div class="mt-1">
        {{ $tc(period, [_ms(proposal.start), _ms(proposal.end)]) }}
      </div>
    </div>
  </router-link>
</template>
