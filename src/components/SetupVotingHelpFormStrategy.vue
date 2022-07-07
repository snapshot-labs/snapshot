<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const { notify } = useFlashNotification();

defineEmits(['submitForm']);

const tokenStandards = ['erc-20', 'erc-721', 'erc-777', 'erc-1155', 'erc-4626'];

const form = reactive<{
  tokenTypes: string[];
  message: string;
  email: string;
}>({
  tokenTypes: ['erc-20'],
  message: '',
  email: ''
});

const formIsSending = ref(false);
const showSuccessMessage = ref(false);
const submitForm = form => {
  formIsSending.value = true;
  setTimeout(() => {
    formIsSending.value = false;
    showSuccessMessage.value = true;
    notify(['green', t('Form sent successfully.')]);
  }, 1000);
};

const MESSAGE_MAX_LENGTH = 1000;

const updateTokenTypes = selectedTypes => {
  form.tokenTypes = selectedTypes.map(type => type.name);
};
</script>

<template>
  <h4>Your custom voting power strategy</h4>
  <div class="space-y-3">
    <div>
      <LabelInput>
        Try to explain briefly how you want to distribute voting power in your
        organization.
      </LabelInput>
      <TextareaAutosize
        v-model="form.message"
        class="s-input !rounded-3xl"
        :max-length="MESSAGE_MAX_LENGTH"
      />
    </div>
    <div>
      <LabelInput>
        What token standards you think will be relevant?
      </LabelInput>
      <BaseListboxMultiple
        :model-value="[]"
        :items="
          tokenStandards.map((t, i) => ({ id: i, name: t.toUpperCase() }))
        "
        @update:model-value="updateTokenTypes"
      />
    </div>
    <BaseInput v-model="form.email" title="Email" />
  </div>
  <BaseButton
    primary
    class="float-right !mt-4"
    :loading="formIsSending"
    @click="submitForm"
  >
    Submit
  </BaseButton>
</template>
