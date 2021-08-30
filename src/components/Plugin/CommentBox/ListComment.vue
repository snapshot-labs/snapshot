<script setup>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
const props = defineProps({
  profiles: Object,
  space: Object,
  allData: Array
});
const threeDotItems = computed(() => {
  const items = [
    { text: 'edit', action: 'edit' },
    { text: 'delete', action: 'delete' }
  ];

  return items;
});
const toggleComment = ref(true);
const toggleEditComment = ref(true);
function selectFromThreedotDropdown(e) {
  if(e==="edit") {toggleEditComment.value=false;toggleComment.value=true;}
}
</script>
<template>
  <div v-if="!toggleEditComment">
    <PluginCommentBoxComment
      buttonName="Edit"
      placeholder="Edit your reply here"
      @dismissComment="toggleEditComment=true"
    />
  </div>
  <div v-if="toggleEditComment">
      <div :key="index" v-for="(item, index) in allData">
    <PluginCommentBoxBlock :slim="true" class="p-4 text-color mt-2 mb-0">
      <div>
        <User
          :address="item.author"
          :profile="profiles[item.author]"
          :space="space"
          class="d-inline-block"
        />
        <UiDropdown
          top="2.5rem"
          right="1.3rem"
          class="float-right"
          @select="selectFromThreedotDropdown"
          :items="threeDotItems"
        >
          <div class="pr-3">
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
      <UiButton
        class="p-1 rounded-0 ml-2"
        style="line-height: 0px; height: auto"
      >
        <Icon :name="'loveit'" class="v-align-middle" size="18" />
        <div class="d-inline-block ml-1">0</div>
      </UiButton>
    </div>
    <UiButton
      @click="toggleComment = false"
      class="p-1 rounded-0 ml-2"
      style="line-height: 0px; height: auto"
    >
      <Icon :name="'receipt-outlined'" class="v-align-middle" size="18" />
      <div class="d-inline-block ml-1">reply</div>
    </UiButton>
    <PluginCommentBoxComment
      v-if="!toggleComment"
      buttonName="Reply"
      @dismissComment="toggleComment = true"
      placeholder="add your reply here"
    />
  </div>
  </div>
  
</template>
