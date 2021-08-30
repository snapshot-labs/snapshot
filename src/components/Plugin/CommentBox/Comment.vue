<script setup>
import { ref, defineProps, defineEmits, onMounted, computed,toRef } from 'vue';
import { clone } from '@/helpers/utils';
const props = defineProps({
  placeholder: String,
  buttonName:String,
  editComment:{
    type: String,
    required: false,
    default:''
  }
});
const editComment=toRef(props,'editComment')
const comment=ref(clone(editComment.value))

const loading=ref(false)
const togglePreview=ref(true)
const emit=defineEmits(['dismissComment']);

</script>
<template>
<div class="mt-2">
<UiButton
v-if="togglePreview"
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
        <TextareaAutosize
    v-model="comment"
    
        :placeholder="placeholder"
        class="input width-full text-left"
        style="font-size: 18px"
      />
    </UiButton>
<PluginCommentBoxBlock v-if="!togglePreview"
      slim="true" class="p-4 h6 text-color mt-2 mb-0">
<UiMarkdown  :body="comment" />      
      </PluginCommentBoxBlock>
    <UiButton
    :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
    >
      {{buttonName}}
    </UiButton>
    <UiButton @click="togglePreview=!togglePreview"   :disabled="comment.length === 0" class="ml-2 mt-2 button--primary"> {{togglePreview?"Preview":"Continue Editing"}} </UiButton>
    <UiButton @click="$emit('dismissComment')" type="text" class="border-0 ml-2 mt-2 button--text"> Dismiss </UiButton>
</div>
    
</template>