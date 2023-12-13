<script setup lang="ts">
import snapshot from '@snapshot-labs/snapshot.js';

const {
  DEFAULT_CURRENCY,
  DEFAULT_PLAN,
  CURRENCIES,
  PLANS,
  BASE_PRICE,
  BASE_CURRENCY,
  fxRates,
  transfer,
  loading,
  paymentTx,
  fxLoaded
} = usePayment(import.meta.env.VITE_DEFAULT_NETWORK);
const { web3Account } = useWeb3();
const modalPostPaymentOpen = ref(false);

const data = reactive({
  tos: false,
  contract_signed: false,
  currency: DEFAULT_CURRENCY,
  plan: DEFAULT_PLAN
});

const amount = computed(() => {
  return computePrice(fxRates[data.currency], PLANS[data.plan].factor);
});

function setData(key: string, value: any) {
  data[key] = value;
}

function pay() {
  transfer(amount.value, data.currency);
}

function computePrice(fxRate = 1, planFactor = 1, discount = 0): number {
  let price = (BASE_PRICE / fxRate) * planFactor;

  if (discount > 0) {
    price = price - (price / 100) * discount;
  }

  return price;
}

function computeFiatPrice(factor = 1, discount = 0): number {
  return computePrice(1, factor, discount);
}

function formatFiatCurrency(amount: number): string {
  return `${BASE_CURRENCY.name} ${
    BASE_CURRENCY.symbol
  }${amount.toLocaleString()}`;
}

function formatCryptoCurrency(amount: number, currency): string {
  return `~${currency.code} ${amount.toLocaleString()}`;
}

watch(paymentTx, () => {
  modalPostPaymentOpen.value = !!paymentTx.value;
});
</script>

<template>
  <TheLayout class="max-w-lg">
    <BaseMessageBlock v-if="!web3Account" level="warning" class="mb-3">
      Connect your wallet first to proceed
    </BaseMessageBlock>

    <h1>Network fees</h1>
    <span class="text-lg">Pay to support your network on Snapshot</span>

    <form v-if="fxLoaded" class="flex flex-col mt-4 gap-4" @submit="pay">
      <fieldset>
        <legend class="mb-2">
          <h2 class="text-lg">Select your package</h2>
        </legend>
        <ol class="flex flex-col gap-2">
          <li v-for="(plan, planId) in PLANS" :key="planId">
            <a
              href="#"
              class="flex gap-3 border-skin-border md:rounded-xl md:border p-3"
              :class="{
                '!border-skin-primary': planId === data.plan
              }"
              @click.stop.prevent="setData('plan', planId)"
            >
              <TuneRadio :value="planId" :model-value="data.plan" />
              <div class="flex-grow">
                <b>{{ plan.label }}</b>
                <BasePill
                  v-if="plan.discount"
                  class="ml-2 py-1 !bg-skin-primary"
                >
                  Save {{ plan.discount }}%
                </BasePill>
                <small class="block text-skin-text">
                  {{
                    formatFiatCurrency(computeFiatPrice(1, plan.discount))
                  }}/month
                </small>
              </div>
              <span>
                {{
                  formatFiatCurrency(
                    computeFiatPrice(plan.factor, plan.discount)
                  )
                }}
              </span>
            </a>
          </li>
        </ol>
      </fieldset>

      <fieldset>
        <legend class="mb-2">
          <h2 class="text-lg">Select your currency</h2>
        </legend>

        <ol class="flex flex-col gap-2">
          <li v-for="(currency, currencyId) in CURRENCIES" :key="currencyId">
            <a
              href="#"
              class="flex align-center border border-skin-border gap-3 md:rounded-xl md:border p-3"
              :class="{
                '!border-skin-primary': currencyId === data.currency
              }"
              @click.stop.prevent="setData('currency', currencyId)"
            >
              <TuneRadio :value="currencyId" :model-value="data.currency" />
              <BaseAvatar
                :src="snapshot.utils.getUrl(currency.logo)"
                size="24"
              />

              <b class="flex-grow">{{ currency.code }}</b>
              <small>
                {{
                  formatCryptoCurrency(
                    computePrice(fxRates[currencyId], PLANS[data.plan].factor),
                    currency
                  )
                }}
              </small>
            </a>
          </li>
        </ol>
      </fieldset>

      <fieldset class="flex flex-col gap-2">
        <TuneCheckbox
          :id="'contract_signed'"
          :model-value="data.contract_signed"
          hint="I have signed the network contract"
          @update:model-value="setData('contract_signed', $event as boolean)"
        />

        <TuneCheckbox
          :id="'tos'"
          :model-value="data.tos"
          hint="I agree to the terms and conditions"
          @update:model-value="setData('tos', $event as boolean)"
        />
      </fieldset>

      <TuneButton
        primary
        :disabled="
          !web3Account || !data.tos || !data.contract_signed || loading
        "
        :type="'submit'"
        :loading="loading"
        @click="pay"
      >
        Pay
        {{ amount.toLocaleString() }}
        {{ CURRENCIES[data.currency].code }} for {{ PLANS[data.plan].label }}
      </TuneButton>
    </form>

    <div v-else>
      <LoadingSpinner />
    </div>

    <ModalPostPayment
      :open="modalPostPaymentOpen"
      :tx="paymentTx"
      @close="modalPostPaymentOpen = false"
    />
  </TheLayout>
</template>
