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
  <h1 class="leading-[44px]">Network plan</h1>
  <p class="mb-4 leading-[20px]">Pay to support your network on Snapshot</p>

  <form v-if="fxLoadStatus === 1" class="flex flex-col gap-4" @submit="pay">
    <fieldset>
      <legend>
        <h2 class="text-[20px] leading-none mb-[12px]">
          Select your plan duration
        </h2>
      </legend>
      <ol class="flex flex-col gap-2">
        <li
          v-for="(plan, planId) in PLANS"
          :key="planId"
          :class="[{ 'bg-[#384aff]/[0.16] rounded-xl ': plan.discount }]"
        >
          <div v-if="plan.discount" class="p-2 text-center text-skin-primary">
            Save
            <BasePill class="ml-2 py-1 !bg-skin-primary"
              >{{ Math.floor(plan.discount) }}%</BasePill
            >
            in your package
          </div>
          <label
            class="flex relative bg-skin-bg gap-3 border border-skin-border hover:border-skin-text rounded-xl p-3 cursor-pointer"
            :class="{
              '!border-skin-primary': planId === data.plan
            }"
            @click="setData('plan', planId)"
          >
            <div class="flex-grow">
              <div class="leading-none">{{ plan.label }}</div>
              <b class="text-skin-heading text-lg">{{
                formatFiatCurrency(computePlanFiatPrice(plan, BASE_UNIT))
              }}</b
              >/mo
            </div>
            <span
              v-if="planId === data.plan"
              :class="['absolute right-0 pr-3']"
            >
              <i-ho-check class="text-skin-primary text-sm" />
            </span>
          </label>
        </li>
      </ol>
    </fieldset>

    <fieldset>
      <legend>
        <h2 class="text-[20px] leading-none mb-[12px]">Select your currency</h2>
      </legend>

      <ol class="flex gap-2">
        <li
          v-for="(currency, currencyId) in CURRENCIES"
          :key="currencyId"
          class="basis-1/3"
        >
          <label
            class="flex relative flex-col sm:flex-row border border-skin-border hover:border-skin-text gap-2 rounded-xl p-[12px] pl-3 cursor-pointer"
            :class="{
              '!border-skin-primary': currencyId === data.currency
            }"
            @click="setData('currency', currencyId)"
          >
            <AvatarToken :address="currency.address[1]" size="18" />

            <small class="leading-none text-skin-heading text-base">{{
              currency.code
            }}</small>
            <span
              v-if="currencyId === data.currency"
              :class="['absolute right-0 pr-3']"
            >
              <i-ho-check class="text-skin-primary text-sm" />
            </span>
          </label>
        </li>
      </ol>
    </fieldset>

    <TuneCheckbox
      :id="'termsAccepted'"
      :model-value="data.termsAccepted"
      hint="By proceeding, I understand that completing the network request form is mandatory after payment."
      @update:model-value="setData('termsAccepted', $event as boolean)"
    >
    </TuneCheckbox>

    <hr />

    <div class="flex items-center justify-between">
      <div class="leading-none">
        Pay now
        <div class="flex gap-2">
          <AvatarToken
            :address="CURRENCIES[data.currency].address[1]"
            size="36"
            class="mt-1"
          />
          <b class="text-2xl leading-[44px] text-skin-heading"
            >{{
              computePrice(
                data.currency,
                PLANS[data.plan].unit,
                PLANS[data.plan].discount
              ).toLocaleString()
            }}
          </b>
        </div>
      </div>
      <TuneButton
        primary
        :disabled="loading || !data.termsAccepted"
        :type="'submit'"
        :loading="loading"
        @click.prevent="pay"
      >
        Go to payment
      </TuneButton>
    </div>
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
