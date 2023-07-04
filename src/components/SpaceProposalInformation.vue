<script setup lang="ts">
import { explorerUrl, getIpfsUrl } from '@/helpers/utils';
import { ExtendedSpace, Proposal, SpaceStrategy } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  strategies: SpaceStrategy[];
}>();

const isModalStrategiesOpen = ref(false);

const { formatRelativeTime, formatNumber } = useIntl();

const symbols = computed((): string[] =>
  props.strategies.map(strategy => (strategy.params.symbol as string) || '')
);
</script>

<template>
  <BaseBlock :title="$t('information')">
    <div class="space-y-1">
      <div>
        <b>{{ $t('strategies') }}</b>
        <span
          class="float-right flex cursor-pointer text-skin-link"
          @click="isModalStrategiesOpen = true"
        >
          <span
            v-for="(symbol, symbolIndex) of symbols.slice(0, 5)"
            :key="symbol"
            class="flex"
          >
            <span
              v-tippy="{
                content: symbol
              }"
            >
              <AvatarSpace :space="space" :symbol-index="symbolIndex" />
            </span>
            <span v-show="symbolIndex !== symbols.length - 1" class="ml-1" />
          </span>
        </span>
      </div>

      <div>
        <b>IPFS</b>
        <BaseLink :link="getIpfsUrl(proposal.ipfs)" class="float-right">
          #{{ proposal.ipfs.slice(0, 7) }}
        </BaseLink>
      </div>
      <div>
        <b>{{ $t('proposal.votingSystem') }}</b>
        <span class="float-right text-skin-link">
          {{ $t(`voting.${proposal.type}.label`) }}
        </span>
      </div>
      <div v-if="proposal.privacy">
        <b>{{ $t('proposal.privacy') }}</b>
        <BaseLink
          v-tippy="{ content: $t(`privacy.${proposal.privacy}.tooltip`) }"
          :link="$t(`privacy.${proposal.privacy}.url`)"
          class="float-right cursor-pointer text-skin-link"
        >
          {{ $t(`privacy.${proposal.privacy}.label`) }}
        </BaseLink>
      </div>
      <div>
        <b>{{ $t('proposal.startDate') }}</b>
        <span
          v-tippy="{
            content: formatRelativeTime(proposal.start)
          }"
          class="float-right text-skin-link"
          v-text="$d(proposal.start * 1e3, 'short', 'en-US')"
        />
      </div>
      <div>
        <b>{{ $t('proposal.endDate') }}</b>
        <span
          v-tippy="{
            content: formatRelativeTime(proposal.end)
          }"
          class="float-right text-skin-link"
          v-text="$d(proposal.end * 1e3, 'short', 'en-US')"
        />
      </div>
      <div>
        <b>{{ $t('snapshot') }}</b>
        <BaseLink
          :link="explorerUrl(proposal.network, proposal.snapshot, 'block')"
          class="float-right"
        >
          {{ formatNumber(Number(proposal.snapshot)) }}
        </BaseLink>
      </div>
    </div>
  </BaseBlock>
  <teleport to="#modal">
    <ModalStrategies
      :open="isModalStrategiesOpen"
      :proposal="proposal"
      :strategies="strategies"
      @close="isModalStrategiesOpen = false"
    />
  </teleport>
</template>
