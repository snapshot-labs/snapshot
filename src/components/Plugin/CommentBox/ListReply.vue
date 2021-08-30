<script setup>
import { defineProps,toRef  } from 'vue';
const props = defineProps({
  reply: Array,
  space: Object,
  profiles: Object
});
</script>
<template>
    <div class="pl-4" :key="index"
      v-for="(item, index) in reply">
        
        <PluginCommentBoxBlock
      :slim="true"
      class="p-4 text-color mt-2 mb-0"
      
    >
    <Block  slim="true">
      <div class="ml-2 mt-2">
 comment by <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block "
        /> 
      </div>
      
        <div class="border-bottom"></div><div class="ml-2 mt-2">dd</div></Block>
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block"
        />
        <UiDropdown class="float-right">
          <div>
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
      <p
        v-text="item.markdown"
        class="break-word mb-1"
        style="font-size: 20px"
      />
      <div class="mt-1">
        <span
          :aria-label="_ms(item.timestamp / 1e3)"
          v-text="$d(item.timestamp, 'short', 'en-US')"
          class="link-color tooltipped tooltipped-n"
        />
      </div>
    </PluginCommentBoxBlock>
    <div class="ml-2 d-inline-block">
     <UiButton class="p-1 rounded-0 ml-2" style="line-height: 0px;height:auto;">
      <Icon :name="'loveit'" class="v-align-middle" size="18" />
      <div class="d-inline-block ml-1">0</div>
    </UiButton>
    </div>
    <UiButton class="p-1 rounded-0 ml-2" style="line-height: 0px;height:auto;">
      <Icon :name="'receipt-outlined'" class="v-align-middle" size="18" />
      <div class="d-inline-block ml-1">reply</div>
    </UiButton>
    </div>
</template>