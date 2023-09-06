<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: any;
  modelValue: any;
  connext: { enabled: boolean; selection: boolean };
}>();

console.log('connext', props.connext);
const { getPluginComponents } = usePlugins();
const components = getPluginComponents(
  'Create',
  Object.keys(props.space.plugins)
);

console.log('components', components)

const emit = defineEmits(['update:modelValue', 'event:connextToggle']);

const update = data => {
  const allConfig = props.modelValue;
  allConfig[data.key] = data.form;
  emit('update:modelValue', allConfig);
};
</script>

<template>
  <div v-if="connext.enabled" class="mb-4">
    <!-- <div v-if="space?.voting?.type && space.voting.type !== 'basic'">
      <h6>Where is oSnap?</h6>
      <p class="mb-3">
        oSnap is currently disabled because your space's voting settings
        disallow the basic voting type which is a requirement for oSnap to work
        properly.
      </p>
      <p>
        Have your admin visit your
        <a :href="`#/${space.id}/settings`">settings page</a> under Voting ->
        Type, and make sure either "Any" or "Basic Voting" is selected. This
        will allow you to create oSnap proposals.
      </p>
    </div> -->
    <div>
      <h6>Connext Proposal</h6>
      <p>
        Are you planning for this proposal to initiate a Connext-based asset transfer between chains if approved? (Remember, Connext enables fast and secure cross-chain transfers without the need for trust or permissions.)
      </p>
      <br />
      <input
        id="toggleConnext"
        type="checkbox"
        :checked="connext.selection"
        @change="$emit('connextToggle')"
      />
      <label for="toggleConnext">
        Yes, use connext for transactions
      </label>
    </div>
  </div>

  <div class="space-y-3">
    <component
      :is="component"
      v-for="(component, key) in components"
      :key="key"
      v-bind="props"
      @update="update"
    />
  </div>
</template>
