<template>
<div class="mt-2">
<UiButton
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
      <TextareaAutosize
    
        :placeholder="`Add your comment here`"
        class="input width-full text-left"
        style="font-size: 18px"
      />
    </UiButton>

    <UiButton
    
      class="mt-2 button--submit"
    >
      Submit
    </UiButton>
    <UiButton class="ml-2 mt-2 button--primary"> Preview </UiButton>
    <UiButton type="text" class="border-0 ml-2 mt-2 button--text"> Dismiss </UiButton>
</div>
    
</template>