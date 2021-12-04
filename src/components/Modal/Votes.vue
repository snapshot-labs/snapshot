<script setup>
import { ref, computed, watch } from 'vue';
import { useProfiles } from '@/composables/useProfiles';
import { getChoiceString } from '@/helpers/utils';

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
    type: Object,
    required: true
  },
  space: {
    type: Object,
    required: true
  },
  titles: {
    type: Object,
    required: true
  },
  voteCount: {
    type: Number,
    required: true
  }
});

defineEmits(['recipe', 'close']);

const format = getChoiceString;

const nbrVisibleVotes = ref(10);

const visibleVotes = computed(() =>
  props.votes.slice(0, nbrVisibleVotes.value)
);

function displayMoreVotes() {
  nbrVisibleVotes.value += 10;
  console.log('mroe');
}

const { profiles, loadProfiles } = useProfiles();

watch(visibleVotes, () => {
  loadProfiles(visibleVotes.value.map(vote => vote.voter));
});

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
      <div
        v-for="(vote, i) in votes.slice(0, nbrVisibleVotes)"
        :key="i"
        :style="i === 0 && 'border: 0 !important;'"
        class="px-4 py-3 border-t flex"
      >
        <User
          :profile="profiles[vote.voter]"
          :address="vote.voter"
          :space="space"
          :proposal="proposal"
          class="column"
        />
        <div class="flex-auto text-center link-color">
          <span
            class="text-center link-color"
            v-tippy="{
              content:
                format(proposal, vote.choice).length > 24
                  ? format(proposal, vote.choice)
                  : null
            }"
          >
            {{ _shorten(format(proposal, vote.choice), 24) }}
          </span>
        </div>

        <div class="column text-right link-color">
          <span
            v-tippy="{
              content: vote.scores
                .map((score, index) => `${_n(score)} ${titles[index]}`)
                .join(' + ')
            }"
          >
            {{ `${_n(vote.balance)} ${_shorten(space.symbol, 'symbol')}` }}
          </span>
          <a
            @click="$emit('recipe', vote), $emit('close')"
            target="_blank"
            class="ml-2 text-color"
            title="Receipt"
          >
            <Icon name="signature" />
          </a>
        </div>
      </div>
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
      <!-- <NoResults v-if="Object.keys(networks).length < 1" /> -->
    </div>
  </UiModal>
</template>
