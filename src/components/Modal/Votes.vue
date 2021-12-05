<script setup>
import { ref, computed, watch } from 'vue';
import { useProfiles } from '@/composables/useProfiles';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  votes: {
    type: Array,
    required: true
  },
  proposal: {
    type: Array,
    required: true
  },
  space: {
    type: Array,
    required: true
  },
  titles: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['receipt', 'close']);

const nbrVisibleVotes = ref(10);

const visibleVotes = computed(() =>
  props.votes.slice(0, nbrVisibleVotes.value)
);

function displayMoreVotes() {
  nbrVisibleVotes.value += 10;
}

const { profiles, loadProfiles } = useProfiles();

watch(visibleVotes, () => {
  loadProfiles(visibleVotes.value.map(vote => vote.voter));
});

function emitReceipt(vote) {
  emit('receipt', vote);
  emit('close');
}

// const searchInput = ref('');
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('Votes') }}</h3>
    </template>
    <!-- <Search
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    /> -->
    <div class="mt-1">
      <VotesRow
        @receipt="emitReceipt"
        :votes="votes.slice(0, nbrVisibleVotes)"
        :proposal="proposal"
        :space="space"
        :titles="titles"
        :profiles="profiles"
      />
      <a
        v-if="nbrVisibleVotes <= votes.length"
        @click="displayMoreVotes"
        class="
          px-4
          py-3
          border-t
          text-center
          block
          header-bg
          rounded-b-none
          md:rounded-b-md
        "
      >
        {{ $t('seeMore') }}
      </a>
    </div>
    <!-- <NoResults v-if="Object.keys(networks).length < 1" /> -->
  </UiModal>
</template>
