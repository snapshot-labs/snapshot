# Plugins

Plugins in Snapshot extend proposal functionality, like visualizing results in a chart or on-chain setteling.
In essence, a plugin can add additional, custom data to a proposal, which can be used when rendering it or processing the results.

## Plugin development

To create a plugin start by creating a new (camelCase) directory in `src/plugins`.

```shell
mkdir src/plugins/myPlugin
```

Now create a `plugin.json` inside of that directory and describe your plugin.

```json
{
  "name": "My Snapshot Plugin",
  "description": "A plugin to show how plugins are built."
}
```

The plugin is now available in the space settings and can be enabled. But so far, it doesn't do anything. So next we will add a component for the proposal page.

In the plugin directory add a `Proposal.vue` and start with a basic single file component.

```html
<script setup>
const msg = 'Hello world!'
</script>

<template>
  <h1>My Plugin</h1>
  <div>{{ msg }}</div>
</template>
```

Now add your plugin to the list in `src/plugins/Proposal.vue`.

```html
<script setup>
// ...
addComponents([
  'myPlugin',
  // ...
])
// ...
</script>
```

The component is now being rendered below the proposal content. From here, you can do everything you can do in any other Vue 3 component. It's technically not required but it's recommended to go with Vue 3's composition API and `<script setup>`.

Currently you can add components to the content area or the sidebar of a proposal.

| Plugin component | needs to be listed here | and will be rendered here. |
| --- | --- | --- |
| `plugins/myPlugin/Proposal.vue` | `plugins/Proposal.vue` | below proposal content |
| `plugins/myPlugin/ProposalSidebar.vue` | `plugins/ProposalSidebar.vue` | proposal sidebar |
| `plugins/myPlugin/Create.vue` | `plugins/Create.vue` | below create proposal content |
| `plugins/myPlugin/CreateSidebar.vue` | `plugins/CreateSidebar.vue` | create proposal sidebar |

## Existing components/composables

Any of the existing UI components in `src/components` or composables in `src/composables` can be used.

```html
<script setup>
import { useWeb3 } from '@/composables/useWeb3'
const { web3Account } = useWeb3();
</script>

<template>
  <Block title='My Plugin'>
    <h2>Your Account: {{ web3Account }}</h1>
  </Block>
</template>
```

## Config defaults

Most plugins will require some configuration options, so that the a space admin can enter their token address, API endpoints,... and so on. Defaults can be defined in the `plugin.json` as follows:

```json
{
  "name": "My Snapshot Plugin",
  "description": "A plugin to show how plugins are built.",
  "defaults": {
    "space": {
      "someURL": "https://..."
    },
    "proposal": {
      "someParam": true
    }
  }
}
```

Under the `"space"` key you can define global config options for all proposals. The `"proposal"` key let's you define options specific to a single proposal.

## Hooks

Hooks allow a plugin to execute a custom function when a certain action is performed on snapshot.org. Currently two hooks are available:

| hook name | executed | payload |
| --- | --- | --- |
| `precreate` | when clicking the publish button, before signing the message | the proposal form content |
| `postcreate` | once the proposal has been successfully saved | the stored proposal content |
| `prevote` | before confirming a vote | vote object |
| `postvote` | once the vote has been successfully saved | the id of the stored vote, the ipfs hash and relayer information |

To use these hooks, you need to specify a path in the `plugin.json` to a file exporting a single function:

```json
{
  "name": "My Snapshot Plugin",
  "description": "A plugin that uses hooks.",
  "hooks": {
    "precreate": "./hooks/precreate.ts",
    "postcreate": "hooks/postcreate"
  }
}
```

The path must be relative to the plugin's directory and the file must be inside of that directory. (`./` and `.ts` can be omitted.)

Now the functions can be created like this:

```ts
// src/plugins/MyPlugin/hooks/precreate.ts
export default (proposalForm): void => {
  console.log('My precreate hook:', proposalForm);
}

// src/plugins/MyPlugin/hooks/postcreate.ts
export default (storedProposal): void => {
  console.log('My postcreate hook:', storedProposal);
}
```

Any existing libraries/packages/composables can be imported normally. When hook functions are executed, they will be `await`ed, so the workflow in the UI can be intercepted.