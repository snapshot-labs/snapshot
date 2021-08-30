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
const emit=defineEmits(['dismissComment']);

</script>
<template>
<div class="mt-2">
<UiButton
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

    <UiButton
    :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2 button--submit"
    >
      {{buttonName}}
    </UiButton>
    <UiButton class="ml-2 mt-2 button--primary"> Preview </UiButton>
    <UiButton @click="$emit('dismissComment')" type="text" class="border-0 ml-2 mt-2 button--text"> Dismiss </UiButton>
</div>
    
</template>