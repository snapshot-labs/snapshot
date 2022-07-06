<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useModal } from '@/composables/useModal';

const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();
</script>

<template>
  <div>
    <div class="space-y-4">
      A snapshot space is the home of your community's governance. It's a place
      where you can create proposals, calculate voting power and vote in various
      ways, and finally execute them in a trustless manner.

      <SetupMessageHelp />

      <h4>ENS</h4>
      To create a space, you need to have a ENS domain name. This domain will be
      the unique name to your space and allow you to control its settings.

      <h4>Controller</h4>
      The controller is the ethereum account that will be used to control the
      space. You will be able to set it in your ENS domain as a text record.

      <h4>Voting types and stategies</h4>
      There are two main settings you can use to control how results are
      calculated. The first is the voting strategy. This is how the weight of
      each vote is set before it is calculated by the voting type. The second is
      the voting type. This is how the vote is casted and the results are
      calculated.

      <h4>Validation</h4>
      Valiadtion allows you to determine who can create a proposal in your
      space. The default is to allow anyone to create a proposal. You can also
      set a whitelist of accounts that can create proposals or a minimum
      threshold of tokens that must be held to create a proposal.
    </div>
    <BaseButton
      primary
      class="float-right mt-4"
      @click="
        !web3Account
          ? (modalAccountOpen = true)
          : $router.push({ query: { step: 2 } })
      "
    >
      Next
    </BaseButton>
  </div>
</template>
