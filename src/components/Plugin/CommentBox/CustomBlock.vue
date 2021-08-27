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
    <Block :slim="true" class="p-4 d-block text-color">
<div>
      <div class="mb-2">
        <!-- <Token :space="proposal.space" size="28" /> -->
        <span class="ml-2" v-text="`dsa`" />
        <span class="ml-2" v-text="`dsa`" />
        <!-- {{ $tc('proposalBy', [username]) }} -->
        <!-- <Badges :address="proposal.author" :members="proposal.space.members" /> -->
        <!-- <UiState :state="proposal.state" class="d-inline-block float-right" /> -->
      </div>
      <h3 v-text="`dsa`" class="mt-1" />
      <p v-text="`sadas`" class="break-word mb-1" style="font-size: 20px" />
      <div class="mt-1">adsad</div>
    </div>
    </Block>
    
  </Block>
</template>
