<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  open: boolean;
}>();

defineEmits(['close']);

const form = ref({
  tags: []
});

const action =
  'https://snapshot.us17.list-manage.com/subscribe/post?u=1c820b717ffe37c1703e33f4b&amp;id=f11d6e5df6';
</script>

<!-- This modal needs to be styled -->
<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('newsletter.stayUpToDate') }}</h3>
    </template>
    <div class="my-2 p-4">
      <form
        :action="action"
        method="post"
        target="_blank"
        autocomplete="off"
        class="relative max-w-[320px]"
      >
        <input type="hidden" name="tags" :value="form.tags" />
        <input
          type="email"
          name="EMAIL"
          class="w-full rounded-full border py-2 px-3 text-md"
          placeholder="Your email"
          required
        />

        Tags
        <div>
          <!-- We need the actual tag names and values from mailchimp here -->
          <input v-model="form.tags" type="checkbox" :value="12345" />
          <label for="12345">Tag 1</label>
        </div>
        <div>
          <input v-model="form.tags" type="checkbox" :value="23456" />
          <label for="23456">Tag 2</label>
        </div>
        <div>
          <input v-model="form.tags" type="checkbox" :value="34567" />
          <label for="34567">Tag 3</label>
        </div>
        <!-- WE will also need to handle errors and success messages -->
        <BaseButton type="submit" name="subscribe">Submit</BaseButton>
      </form>
    </div>
  </BaseModal>
</template>
