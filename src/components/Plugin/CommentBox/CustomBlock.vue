<template>
    <Block title="Comment Box">
        <UiButton class="d-block width-full px-3" style="height: auto;cursor:default">
              <TextareaArray
               
                :placeholder="`Add your comment here`"
                class="input width-full text-left"
                style="font-size: 18px"
              />
            </UiButton>
            <div>

            </div>
            <UiButton
         
          class=" mt-2 button--submit"
        >
          Submit
        </UiButton>
        <UiButton
          class="ml-2 mt-2 button--primary"
        >
          Preview
        </UiButton>
    </Block>
</template>