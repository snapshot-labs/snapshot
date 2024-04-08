<script setup>
const props = defineProps({
  space: Object
});

const timezone = Intl.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 'UTC';

const automationTemplates = computed(() => [
  {
    name: 'Send Discord Alert 48h Before Proposal End',
    imageUrl: 'https://domino-static.s3.eu-west-3.amazonaws.com/discord-logo.svg',
    url: `https://domino.run/explore/templates/32?spaceId=${encodeURIComponent(props.space.id)}`
  },
  {
    name: 'Send Telegram Alert 24h Before Proposal End If Quorum Not Reached',
    imageUrl: 'https://telegram.org/img/apple-touch-icon.png',
    url: `https://domino.run/explore/templates/36?spaceId=${encodeURIComponent(props.space.id)}`
  },
  {
    name: 'Send New Proposals to Discord',
    imageUrl: 'https://domino-static.s3.eu-west-3.amazonaws.com/discord-logo.svg',
    url: `https://domino.run/explore/templates/28?snapshotSpaceID=${encodeURIComponent(props.space.id)}&timezone=${encodeURIComponent(timezone)}`
  },
  {
    name: 'Send New Proposals to Telegram',
    imageUrl: 'https://telegram.org/img/apple-touch-icon.png',
    url: `https://domino.run/explore/templates/29?snapshotSpaceID=${encodeURIComponent(props.space.id)}&timezone=${encodeURIComponent(timezone)}`
  },
  {
    name: 'Send New Proposals to Slack',
    imageUrl: 'https://domino-static.s3.eu-west-3.amazonaws.com/slack-logo.png',
    url: `https://domino.run/explore/templates/30?snapshotSpaceID=${encodeURIComponent(props.space.id)}&timezone=${encodeURIComponent(timezone)}`
  },
]);

const customWorkflowUrl = computed(() => {
  const triggerConfig = {
    conditions: [
      {
        "operator": "and",
        "conditions": [
          {
            "key": "space",
            "type": "string",
            "value": {
              "comparator": "eq",
              "value": props.space.id
            }
          }
        ]
      }
    ]
  };

  return `https://domino.run/automations/create?triggerUuid=${encodeURIComponent('snapshot-tmkg6ni3l3r@1.0.0/proposal-event')}&triggerConfig=${encodeURIComponent(JSON.stringify(triggerConfig))}`;
});

</script>

<template>
  <TuneBlock>
    <template #header>
      <TuneBlockHeader :title="$t('domino.title')" :information="$t('domino.information')"/>
    </template>

    <div>
      <ul class="space-y-2">
        <li v-for="(item, index) in automationTemplates" :key="index" class="flex items-center justify-between gap-4 group">
          <a :href="`${item.url}`" target="_blank" class="flex items-center gap-2">
            <img
              class="mx-auto rounded-xl border border-skin-border opacity-95 group-hover:opacity-100"
              :src="item.imageUrl"
              :alt="item.name"
              width="36"
              height="36"
            />

            <div class="text-sm leading-tight group-hover:text-gray-800">{{ item.name }}</div>
          </a>
        </li>
        
        <li class="text-center">
          <a href="https://domino.run/explore/apps/snapshot-tmkg6ni3l3r" target="_blank">

            <div class="text-sm leading-tight group-hover:text-gray-800 text-skin-link">
              {{ $t('domino.viewMore') }}
            </div>
          </a>
        </li>
      </ul>

      <div class="py-3 text-center">
        <a :href="customWorkflowUrl" target="_blank">
          <TuneButton>{{ $t('domino.createCustomWorkflow') }}</TuneButton>
        </a>
      </div>
    </div>

    <div class="flex items-center justify-center pt-2">
      <a href="https://domino.run/" target="_blank">
        <img class="block flex-0 h-4" src="https://domino-static.s3.eu-west-3.amazonaws.com/domino-logo-full.png" alt="Domino"  />
      </a>
    </div>
  </TuneBlock>
</template>
