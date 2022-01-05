# Plugins

To create a plugin start by creating a new (camelcased) directory in `src/plugins`.

```shell
mkdir src/plugins/MyPlugin
```

Now create a `plugin.json` inside of that directory and describe your plugin.

```json
{
  "name": "My Snapshot Plugin",
  "description": "A plugin to show how plugins are built."
}
```

The plugin is now available in the space settings and can be enabled for a space. Next we will add a component for the proposal page.

In your plugin directory add a `Proposal.vue` and start with a basic single file component.

```html
<script setup>
const date = new Date()
</script>

<template>
  <h1>My Plugin</h1>
  <div>{{ date }}</div>
</template>
```

Now add your component in `src/plugins/Proposal.vue`.

```html
<script setup>
// import your component
import MyPluginProposal from './MyPlugin/Proposal.vue';
// ...
</script>

<template>
  <MyPluginProposal /> <!-- add your component -->
  <!-- ... -->
</template>
```

The component is now being rendered below the proposal content. From here, you can do everything you can do in any other Vue 3 component. You only need to be familiar with the composition API and the `<script setup>` syntax and you should be fine.

Any of the existing UI components in `src/components` or composables in `src/composables` can be imported.

```html
<script setup>
import { useWeb3 } from '@/composables/useWeb3'
const { web3Account } = useWeb3();
</script>

<template>
  <h1>Account: {{ web3Account }}</h1>
</template>
```

## Plugin slots

### Create

[img]

### TimelineSidebar

[img]

### TimelineProposal

[img]

### Proposal

[img]

### ProposalSidebar

[img]

# Properties/Events