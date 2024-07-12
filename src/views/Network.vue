<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

const CUSTOMERS = [
  {
    name: 'Blast',
    avatar:
      'ipfs://bafkreicqhrimt2zyp2kvhmbpvffxlmxovkg5vw6zkissyzibcfy45kbvrm',
    website: 'https://blast.io'
  },
  {
    name: 'Starknet',
    avatar:
      'ipfs://bafkreib5g7a6ufzpo5ebeosetgzoy5geduwcgmch7vighsbasth3wty77q',
    website: 'https://starknet.io'
  },
  {
    name: 'Linea',
    avatar:
      'ipfs://bafkreihtyzolub3sejuwc32hpdpjnt7ksowaguni2yuho3kyihhcqrtqce',
    website: 'https://linea.build'
  },
  {
    name: 'Merlin',
    avatar:
      'ipfs://bafkreicew2qv3m756m7xs2nrjezinghps7rlessrqjqetvox74w4hov2xe',
    website: 'https://merlinchain.io'
  },
  {
    name: 'Immutable zkEVM',
    avatar:
      'ipfs://bafkreiepnhfv3hgexddjpyaeemxo3byhtxxit6t4zsponyczee6ddjqxwi',
    website: 'https://www.immutable.com'
  },
  {
    name: 'Cyber',
    avatar:
      'ipfs://bafkreifm2bbehoqpz4454o7gixnxfi6cgvqlxigqr3f6ipj7l2omtgfgnm',
    website: 'https://cyber.co'
  },
  {
    name: 'Sei',
    avatar: 'ipfs://bafkreiammyt7uztbztqbcqv4bydnczsh2fqmnjf6jxj4xnskzzl6sjrigq',
    website: 'https://www.sei.io'
  },
  {
    name: 'Gravity',
    avatar:
      'ipfs://bafkreia7lrda6v2fc5dthazn3qdost4yd2qrn3r4ntrd6lgmc2gvtvvhoa',
    website: 'https://gravity.xyz'
  }
];
const FAQ = [
  {
    question: 'What payment methods does Snapshot accept?',
    answer: 'Snapshot accepts payments in USDC, USDT, DAI, and GHO stablecoins.'
  },
  {
    question: 'What are the requirements to add a network?',
    answer:
      'To add a network on Snapshot, it must be EVM compatible. Additionally, a full archive node is required to calculate voting power at a specific block. Snapshot can use node providers to meet this requirement and ensure smooth integration and functionality.'
  },
  {
    question: 'How to add a network that is not EVM compatible?',
    answer:
      'Adding a non-EVM network is possible under certain conditions. Please contact us for more details.'
  },
  {
    question: 'Does the network plan include Snapshot X?',
    answer:
      'No, this network plan does not include Snapshot X, our onchain voting protocol. If you are interested in a Snapshot X integration, please reach out.'
  }
];
const LINK = 'https://tally.so/r/31ApGb';

const currentQuestion = ref();

function toggleQuestion(id) {
  currentQuestion.value = currentQuestion.value === id ? '' : id;
}

useMeta({
  title: { key: 'Network' },
  description: { key: 'Support for your network on Snapshot.' }
});
</script>
<template>
  <div class="space-y-[80px] -mt-4 mb-[64px] network-blocks">
    <div class="py-[64px] text-center">
      <BaseContainer class="!max-w-[880px] my-1">
        <h1 class="mb-4 mono max-w-[600px] mx-auto font-weight-700">
          Unlock governance for your ecosystem.
        </h1>
        <div class="space-x-2">
          <a target="_blank">
            <a :href="LINK" target="_blank">
              <TuneButton primary>
                Talk to sales
                <i-ho-arrow-sm-right class="inline-block -rotate-45" />
              </TuneButton>
            </a>
          </a>
        </div>
      </BaseContainer>
    </div>
    <BaseContainer class="px-4 mx-auto !max-w-[880px] text-center">
      <div class="eyebrow mb-2">Key features</div>
      <h1 class="text-[34px] mb-3 leading-[1.3em]">
        What the network plan offers
      </h1>
      <div class="text-[21px] leading-[31.5px] mb-4 max-w-[500px] mx-auto">
        Our network plan is designed to provide the infrastructure and support
        needed for effective governance.
      </div>
      <div
        class="text-skin-link text-[22px] space-y-1.5 px-5 pt-3 pb-4 border text-left rounded-lg max-w-[500px] mx-auto"
      >
        <h3 class="text-[22px] leading-[33px] mb-0">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Mainnet network support
        </h3>
        <h3 class="text-[22px] leading-[33px] mb-0 mt-[6px]">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Testnet network support
        </h3>
        <h3 class="text-[22px] leading-[33px] mb-0 mt-[6px]">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Custom domain registry support
        </h3>
        <h3 class="text-[22px] leading-[33px] mb-0 mt-[6px]">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Dedicated customer support
        </h3>
        <h3 class="text-[22px] leading-[33px] mb-0 mt-[6px]">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Quick setup (~48 hours)
        </h3>
        <h3 class="text-[22px] leading-[33px] mb-0 mt-[6px]">
          <i-ho-check
            class="w-[20px] h-[20px] inline-block text-skin-success mr-2"
          />
          Co-marketing
        </h3>
      </div>
    </BaseContainer>
    <BaseContainer class="!max-w-[880px] text-center">
      <div class="eyebrow mb-4">Trusted by</div>
      <div class="flex flex-wrap gap-4 justify-center">
        <a
          v-for="(customer, i) in CUSTOMERS"
          :key="i"
          target="_blank"
          :href="customer.website"
        >
          <img
            :alt="customer.name"
            :src="getIpfsUrl(customer.avatar)"
            class="w-[54px] h-[54px] rounded-lg"
          />
        </a>
      </div>
    </BaseContainer>

    <BaseContainer class="!max-w-[880px] text-center">
      <div class="eyebrow mb-2">Get started</div>
      <h1 class="mb-3 text-[34px] leading-[44.2px]">Start your integration</h1>
      <a :href="LINK" target="_blank">
        <TuneButton primary>
          Talk to sales
          <i-ho-arrow-sm-right class="inline-block -rotate-45" />
        </TuneButton>
      </a>
    </BaseContainer>

    <BaseContainer class="!max-w-[880px]">
      <div class="border p-4 rounded-lg">
        <h3 class="mb-1 mt-0 leading-[33px] text-[22px]">
          <i-ho-exclamation-circle
            class="inline-block mr-1 w-[20px] h-[20px]"
          />
          Is your network already live on Snapshot?
        </h3>
        <div class="text-md">
          Starting July 1, 2024, all networks must subscribe to the network plan
          to maintain support on Snapshot. To ensure continuous service and
          avoid interruptions, please contact our team today.
        </div>
      </div>
    </BaseContainer>
    <BaseContainer class="!max-w-[880px]">
      <div class="mb-2 eyebrow text-center">Frequently asked questions</div>
      <h1 class="mb-3 text-center text-[34px] leading-[44.2px]">Questions?</h1>
      <div v-for="(question, i) in FAQ" :key="i" class="border-b">
        <a class="flex items-center" @click="toggleQuestion(i)">
          <h3 class="py-3 flex-auto text-[22px] leading-[32px] my-0">
            {{ question.question }}
          </h3>
          <i-ho-minus-sm v-if="currentQuestion === i" class="text-skin-text" />
          <i-ho-plus-sm v-else class="text-skin-text" />
        </a>
        <div v-if="currentQuestion === i" class="text-[21px] pb-4 -mt-1">
          {{ question.answer }}
        </div>
      </div>
    </BaseContainer>
  </div>
</template>
