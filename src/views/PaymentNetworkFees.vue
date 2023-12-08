<script setup lang="ts">
const {
  DEFAULT_CURRENCY,
  DEFAULT_PLAN,
  CURRENCIES,
  PLANS,
  BASE_PRICE,
  BASE_CURRENCY,
  fxRates,
  transfer,
  loading
} = usePayment(import.meta.env.VITE_DEFAULT_NETWORK);
const { web3Account } = useWeb3();

const data = reactive({
  tos: true,
  currency: DEFAULT_CURRENCY,
  plan: DEFAULT_PLAN
});

const amount = computed(() => {
  return computePrice(fxRates[data.currency], data.plan.factor);
});

function setData(key: string, value: any) {
  data[key] = value;
}

function pay() {
  transfer(amount.value, data.currency);
}

function computePrice(currencyFactor: number, planFactor: number) {
  return currencyFactor * BASE_PRICE * planFactor;
}
</script>

<template>
  <TheLayout>
    <BaseMessageBlock v-if="!web3Account" level="warning">
      Connect your wallet
    </BaseMessageBlock>

    <h1>Network fees</h1>
    Pay to support your network on Snapshot

    <form class="flex flex-col mt-4 gap-3" @submit="pay">
      <fieldset>
        <legend><h2>Select your plan</h2></legend>
        <ol class="grid grid-flow-col gap-3 justify-stretch">
          <li
            v-for="plan in PLANS"
            :key="plan"
            class="cursor-pointer border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border p-3"
            :class="{
              '!border-skin-primary': plan.label === data.plan.label
            }"
            @click="setData('plan', plan)"
          >
            <b>{{ plan.label }}</b>
            <div>
              <h4 class="inline">
                {{ BASE_CURRENCY.name }} {{ BASE_CURRENCY.symbol
                }}{{
                  (
                    BASE_PRICE * plan.factor -
                    (plan.discount
                      ? (BASE_PRICE * plan.factor * plan.discount) / 100
                      : 0)
                  ).toLocaleString()
                }}
              </h4>
              <span
                v-if="plan.discount"
                class="bg-yellow-100 p-1 rounded text-sm ml-1"
              >
                -{{ plan.discount }}%
              </span>
            </div>

            <small
              >{{ BASE_CURRENCY.name }} {{ BASE_CURRENCY.symbol
              }}{{
                (
                  BASE_PRICE -
                  (plan.discount
                    ? (BASE_PRICE * plan.factor * plan.discount) / 100
                    : 0)
                ).toLocaleString()
              }}/month</small
            >
          </li>
        </ol>
      </fieldset>

      <fieldset>
        <legend><h2>Select you currency</h2></legend>

        <ol class="grid grid-flow-col gap-3 justify-stretch">
          <li
            v-for="currency in CURRENCIES"
            :key="currency"
            class="cursor-pointer border border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border p-3"
            :class="{
              '!border-skin-primary': currency.code === data.currency
            }"
            @click="setData('currency', currency.code)"
          >
            <div>
              <b>{{ currency.name }}</b>
            </div>
            <small>
              ~{{
                computePrice(
                  fxRates[currency.code],
                  data.plan.factor
                ).toLocaleString()
              }}
              {{ currency.code }}
            </small>
          </li>
        </ol>
      </fieldset>

      <TuneCheckbox
        :id="'tos'"
        :model-value="data.tos"
        hint="I agree to the terms and conditions"
        @update:model-value="setData('tos', $event as boolean)"
      />

      <TuneButton
        primary
        :disabled="!web3Account || !data.tos || loading"
        :type="'submit'"
        :loading="loading"
        @click="pay"
      >
        Pay
        {{ amount.toLocaleString() }}
        {{ data.currency }} for {{ data.plan.label }}
      </TuneButton>
    </form>
  </TheLayout>
</template>
