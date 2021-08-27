<template>
  <Block title="Comment Box">
    <UiButton
      class="d-block width-full px-3"
      style="height: auto; cursor: default"
    >
      <TextareaArray
        :placeholder="`Add your comment here`"
        class="input width-full text-left"
        style="font-size: 18px"
      />
    </UiButton>
    <div></div>
    <UiButton class="mt-2 button--submit"> Submit </UiButton>
    <UiButton class="ml-2 mt-2 button--primary"> Preview </UiButton>
    <Block :slim="true" class="p-4 d-block text-color mt-2">
      <div>
        <div class="mb-2">
          <Token :space="{space:{id:'thanku.eth'}}" size="23" />
          <span class="ml-2" v-text="`dsa`" />
          <UiDropdown
                            
              class="float-right"
             
            >
              <div >
                <UiLoading v-if="dropdownLoading" />
                <Icon
                  v-else
                  name="threedots"
                  size="25"
                  class="v-align-text-bottom"
                />
              </div>
            </UiDropdown>
        </div>
         <p v-text="`sadas`" class="break-word mb-1" style="font-size: 20px" />
        <div class="mt-1">adsad</div>
      </div>
    </Block>
  </Block>
</template>
