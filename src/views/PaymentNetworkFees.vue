<script setup lang="ts">
useMeta({
  title: {
    key: 'Network plan'
  },
  description: {
    key: 'Pay to support your network on Snapshot.'
  }
});

const {
  DEFAULT_CURRENCY,
  DEFAULT_PLAN,
  CURRENCIES,
  PLANS,
  BASE_PRICE,
  BASE_UNIT,
  BASE_CURRENCY,
  fxRates,
  transfer,
  paymentTx,
  loading,
  fxLoadStatus,
  modalUnsupportedNetworkOpen
} = usePayment(parseInt(import.meta.env.VITE_DEFAULT_NETWORK));
const { web3 } = useWeb3();
const { modalAccountOpen } = useModal();
const modalPostPaymentOpen = ref(false);

const data = reactive({
  termsAccepted: false,
  currency: DEFAULT_CURRENCY,
  plan: DEFAULT_PLAN
});

const amount = computed(() => {
  return computePrice(
    data.currency,
    PLANS[data.plan].unit,
    PLANS[data.plan].discount
  );
});

function setData(key: string, value: string | boolean) {
  data[key] = value;
}

function pay() {
  !web3.value.account || !data.termsAccepted
    ? (modalAccountOpen.value = true)
    : transfer(amount.value, data.currency);
}

function computePrice(
  currencyId: string | null,
  unit: number,
  discount = 0
): number {
  const fxRate = currencyId ? fxRates[currencyId] : 1;
  let price = (BASE_PRICE / fxRate) * unit;

  if (discount > 0) {
    price = price - (price / 100) * discount;
  }

  return currencyId === 'ethereum' ? price : Math.round(price);
}

function computePlanFiatPrice(plan, unit?: number): number {
  return computePrice(null, unit || plan.unit, plan.discount);
}

function formatFiatCurrency(amount: number): string {
  return `${BASE_CURRENCY.symbol}${Math.round(amount).toLocaleString()}`;
}

function formatCryptoCurrency(amount: number, currency): string {
  return `${amount.toLocaleString()} ${currency.code}`;
}

watch(paymentTx, () => {
  modalPostPaymentOpen.value = !!paymentTx.value;
});
</script>

<template>
  <h1>Network plan</h1>
  <p class="text-md mb-4 leading-5">Pay to support your network on Snapshot</p>

  <form v-if="fxLoadStatus === 1" class="flex flex-col gap-4" @submit="pay">
    <fieldset>
      <legend>
        <h2 class="text-lg mb-2">Select your plan duration</h2>
      </legend>
      <ol class="flex flex-col gap-2">
        <li v-for="(plan, planId) in PLANS" :key="planId">
          <label
            class="flex gap-3 border border-skin-border hover:border-skin-text rounded-xl p-3 cursor-pointer"
            :class="{
              '!border-skin-primary': planId === data.plan
            }"
            @click="setData('plan', planId)"
          >
            <div class="flex-grow">
              <b class="text-skin-heading">{{ plan.label }}</b>
              <BasePill v-if="plan.discount" class="ml-2 py-1 !bg-skin-primary"
                >-{{ Math.floor(plan.discount) }}%</BasePill
              >
              <small class="block text-skin-text">
                {{ formatFiatCurrency(computePlanFiatPrice(plan, BASE_UNIT)) }}
                per month
              </small>
            </div>
            <b class="text-skin-heading">
              {{ formatFiatCurrency(computePlanFiatPrice(plan)) }}
            </b>
          </label>
        </li>
      </ol>
    </fieldset>

    <fieldset>
      <legend>
        <h2 class="text-lg mb-2">Select your currency</h2>
      </legend>

      <ol class="flex gap-2">
        <li
          v-for="(currency, currencyId) in CURRENCIES"
          :key="currencyId"
          class="basis-1/3"
        >
          <label
            class="flex border border-skin-border hover:border-skin-text gap-3 rounded-xl p-3 cursor-pointer"
            :class="{
              '!border-skin-primary': currencyId === data.currency
            }"
            @click="setData('currency', currencyId)"
          >
            <AvatarToken :address="currency.address[1]" size="30" />
            <div>
              <div class="text-skin-heading">
                {{
                  computePrice(
                    currencyId,
                    PLANS[data.plan].unit,
                    PLANS[data.plan].discount
                  ).toLocaleString()
                }}
              </div>
              <small class="leading-none">{{ currency.code }}</small>
            </div>
          </label>
        </li>
      </ol>
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <TuneCheckbox
        :id="'termsAccepted'"
        :model-value="data.termsAccepted"
        hint="I confirm I will provide all required information in the network request form"
        @update:model-value="setData('termsAccepted', $event as boolean)"
      >
      </TuneCheckbox>
    </fieldset>

    <TuneButton
      primary
      :disabled="loading || !data.termsAccepted"
      :type="'submit'"
      :loading="loading"
      @click.prevent="pay"
    >
      Pay
      {{ formatCryptoCurrency(amount, CURRENCIES[data.currency]) }} for
      {{ PLANS[data.plan].label }}
    </TuneButton>
  </form>

  <div v-else-if="fxLoadStatus === 0">
    <LoadingSpinner />
  </div>

  <BaseMessageBlock v-else level="warning-red" is-responsive>
    Unable to load the form. Please try again later.
  </BaseMessageBlock>

  <ModalPostPayment
    :open="modalPostPaymentOpen"
    :tx="paymentTx"
    @close="modalPostPaymentOpen = false"
  />
  <ModalUnsupportedNetwork
    :open="modalUnsupportedNetworkOpen"
    hide-demo-button
    @close="modalUnsupportedNetworkOpen = false"
    @network-changed="pay"
  />
</template>
