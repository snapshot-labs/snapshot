<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCreateProposal } from '@/composables/useCreateProposal';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();
const { preview, form, bodyLimit } = useCreateProposal();

const nameInput = ref<any>(null);

// Focus proposal name field when page loads
watch(nameInput, () => nameInput?.value?.focus());
</script>

<template>
  <div class="px-4 md:px-0">
    <div class="flex flex-col mb-6">
      <h1
        v-if="preview"
        v-text="form.name || $t('create.untitled')"
        class="mb-2 w-full break-all"
      />
      <input
        v-else
        v-model="form.name"
        maxlength="128"
        class="text-2xl font-bold input mb-2 w-full"
        :placeholder="$t('create.question')"
        ref="nameInput"
      />
      <div class="relative group">
        <TextareaAutosize
          v-if="!preview"
          v-model="form.body"
          class="input pt-0 w-full"
          style="font-size: 22px"
          :placeholder="$t('create.content')"
          :max-length="bodyLimit"
        />

        <!-- Indicator for number of available characters in body -->
        <div
          class="absolute right-0 bottom-2 hidden group-focus-within:block p-1 bg-skin-bg"
          :class="{ 'text-red': form.body.length === bodyLimit }"
        >
          {{ `${form.body.length} / ${bodyLimit}` }}
        </div>
      </div>

      <div v-if="form.body && preview" class="mb-4">
        <UiMarkdown :body="form.body" />
      </div>
      <p v-if="form.body.length > bodyLimit" class="!text-red mt-4">
        -{{ formatCompactNumber(-(bodyLimit - form.body.length)) }}
      </p>
    </div>
  </div>
</template>
