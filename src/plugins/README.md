# Plugins

Plugins in Snapshot extend proposal functionality, like adding extra information or on-chain setteling.
In essence, a plugin can add additional, custom data to a proposal, which can be used when rendering it or processing the results.

> To avoid confusion, it is worth mentioning here that the plugin system is not meant to support and make available any arbitrary plugin out of the box.
> Rather, it is a curated list of optional core functionality, following a common pattern. Development of new plugins should be coordinated with the snapshot team.

## Create new plugin

To create a plugin start by creating a `plugin.json` inside of a new (camelCased) directory in `src/plugins`.

```shell
mkdir src/plugins/myPlugin && echo '{
  "name": "My Snapshot Plugin",
  "description": "A plugin to show how plugins are built."
}' > src/plugins/myPlugin/plugin.json
```

The plugin is now available in the space settings and can be enabled. But so far, it doesn't do anything. Next we will add a component for the proposal page.

## Components

In the plugin directory add a `Proposal.vue` and start with a basic single file component.

```vue
<script setup>
const msg = 'Hello world!';
</script>

<template>
  <h1>My Plugin</h1>
  <div>{{ msg }}</div>
</template>
```

For spaces that enable the plugin, the component is now automatically being rendered below the proposal content.

Here's the current list of possible plugin components:

| Plugin component               | will be rendered here:          |
| ------------------------------ | ------------------------------- |
| `myPlugin/Proposal.vue`        | below proposal content          |
| `myPlugin/ProposalSidebar.vue` | proposal sidebar                |
| `myPlugin/Create.vue`          | proposal creation, plugins step |

In those components you can do everything you can do in any other Vue 3 component. You can split the code across multiple components and import them in one of the above, as well as create your own composables or other helper files to structure your code as you like.

It's technically not required but recommended to use Vue 3's composition API and the `<script setup>` syntax.

### Properties

To do something meaningful, a plugin will probably need some awareness of the current context (space, proposal, etc). This information is passed down to the plugin components as properties. A component on the proposal page, that needs the proposal's id can receive like this:

```vue
<script setup>
defineProps({
  id: Object // the current proposal's id
});
</script>

<template>
  <a :href="'https://...' + id"> ...
</template>
```

Here are all properties passed down to plugin components:

|                   | Create form     | Proposal page                           |
| ----------------- | --------------- | --------------------------------------- |
| **proposal**      | form content    | current proposal                        |
| **space**         | space settings  | space settings                          |
| **preview**       | preview enabled | -                                       |
| **id**            | -               | proposal id route parameter             |
| **results**       | -               | current voting results                  |
| **loadedResults** | -               | whether voting results finished loading |
| **votes**         | -               | list of individual votes                |
| **strategies**    | -               | used strategies                         |

## Existing components/composables

Any of the existing UI components in `src/components`, composables in `src/composables` or installed packages (like [snapshot.js](https://docs.snapshot.org/snapshot.js)) can be used normally.

```vue
<script setup>
import { useWeb3 } from '@/composables/useWeb3'
const { web3Account } = useWeb3();
</script>

<template>
  <BaseBlock title='My Plugin'>
    <h2>Your Account: {{ web3Account }}</h1>
  </BaseBlock>
</template>
```

## Config defaults

Most plugins will require some configuration options, so that the a space admin can enter their token address, API endpoints and so on. Defaults can be defined in the `plugin.json` as follows:

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

Under the `"space"` key you can define global config options. They can then be set in the plugin section on a space's settings page.

The `"proposal"` key let's you define options specific to a single proposal. This key must be set in order for the `Create.vue` component to be shown in the proposal creation process.

## Localization

The snapshot.org interface supports multiple languages and new plugins should be built with that in mind. Don't use raw text strings in your plugin's components directly but use the `t` function instead:

```vue
<template>
  <h1>{{ $t('myPlugin.hello') }}</h1>
</template>
```

The actual strings needs to be added in `src/locales/default.json` to be available for translators, in order to update the language specific files, like `de-DE.json`. You can add your strings on the highest level in `default.json`, under a unique key, e.g. your plugin's directory name.

```json
{
  "myPlugin": {
    "hello": "Hello World!"
  }
}
```

Learn more about localization in Vue [here](https://vue-i18n.intlify.dev/).

### Numbers and relative time

Apart from `vue-i18n`, there are custom number and time formatters available in the `useIntl` composable.

```vue
<script setup>
import { useIntl } from '@/composables/useIntl';

const {
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatCompactNumber,
  formatPercentNumber
} = useIntl();
</script>

<template>
  <div>
    {{ formatRelativeTime(1643350286) }}
    <!-- "5 minutes ago" -->
    {{ formatDuration(654) }}
    <!-- "11 minutes" -->
    {{ formatNumber(1643350) }}
    <!-- "1,643,350" -->
    {{ formatCompactNumber(1643350) }}
    <!-- "1.6M" -->
    {{ formatPercentNumber(0.86543) }}
    <!-- "86.54%" -->
  </div>
</template>
```
