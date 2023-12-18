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
  fxLoadStatus
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
  return computePrice(data.currency, PLANS[data.plan].unit);
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

  return price;
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
  <p class="text-md mb-4 leading-5">Pay to support your network on Snapshot.</p>

  <form v-if="fxLoadStatus === 1" class="flex flex-col gap-4" @submit="pay">
    <fieldset>
      <legend>
        <h2 class="text-lg mb-2">Select your package</h2>
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
            <TuneRadio :value="planId" :model-value="data.plan" />
            <div class="flex-grow">
              <b class="text-skin-heading">{{ plan.label }}</b>
              <BasePill v-if="plan.discount" class="ml-2 py-1 !bg-skin-primary">
                -{{ Math.round(plan.discount) }}%
              </BasePill>
              <small class="block text-skin-text">
                {{
                  formatFiatCurrency(computePlanFiatPrice(plan, BASE_UNIT))
                }}/month
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

      <ol class="flex flex-col gap-2">
        <li v-for="(currency, currencyId) in CURRENCIES" :key="currencyId">
          <label
            class="flex border border-skin-border hover:border-skin-text gap-3 rounded-xl p-3 cursor-pointer"
            :class="{
              '!border-skin-primary': currencyId === data.currency
            }"
            @click="setData('currency', currencyId)"
          >
            <TuneRadio :value="currencyId" :model-value="data.currency" />
            <div class="flex gap-2 flex-grow">
              <AvatarToken :address="currency.address[1]" size="24" />
              <b class="flex-grow text-skin-heading">{{ currency.code }}</b>
            </div>
            <small class="text-skin-heading">
              {{
                formatCryptoCurrency(
                  computePrice(currencyId, PLANS[data.plan].unit),
                  currency
                )
              }}
            </small>
          </label>
        </li>
      </ol>
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <TuneCheckbox
        :id="'termsAccepted'"
        :model-value="data.termsAccepted"
        @update:model-value="setData('termsAccepted', $event as boolean)"
      >
        <template #hint>
          I agree to the
          <BaseLink link="https://docs.snapshot.org" hide-external-icon>
            terms and conditions.</BaseLink
          >
        </template>
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
      {{ amount.toLocaleString() }}
      {{ CURRENCIES[data.currency].code }} for {{ PLANS[data.plan].label }}
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
</template>
