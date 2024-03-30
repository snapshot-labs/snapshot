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
  YEARLY_PRICE,
  BASE_PRICE,
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

function formatFiatCurrency(amount: number): string {
  return `${BASE_CURRENCY.symbol}${Math.round(amount).toLocaleString()}`;
}

watch(paymentTx, () => {
  modalPostPaymentOpen.value = !!paymentTx.value;
});
</script>

<template>
  <h1 class="leading-[44px] mb-[2px]">Network plan</h1>
  <p class="mb-4 leading-[20px]">Pay to support your network on Snapshot</p>

  <form v-if="fxLoadStatus === 1" class="flex flex-col gap-4" @submit="pay">
    <div class="border border-skin-border rounded-xl py-[12px] px-3">
      <div class="leading-none gap-[2px] flex flex-col">
        <div>Yearly</div>
        <div>
          <b class="text-skin-heading leading-none text-lg">{{
            formatFiatCurrency(YEARLY_PRICE)
          }}</b>
        </div>
      </div>
    </div>

    <fieldset>
      <legend
        class="text-[20px] mb-[12px] leading-none text-skin-heading font-semibold"
      >
        Select your currency
      </legend>

      <ol class="flex gap-2">
        <li
          v-for="(currency, currencyId) in CURRENCIES"
          :key="currencyId"
          class="basis-1/3"
        >
          <label
            class="flex relative flex-col sm:flex-row gap-2 ring-1 ring-skin-border hover:ring-skin-text rounded-xl p-[12px] pl-3 cursor-pointer"
            :class="{
              '!ring-skin-primary': currencyId === data.currency
            }"
            tabindex="0"
            @click="setData('currency', currencyId)"
            @keyup.space="setData('currency', currencyId)"
          >
            <AvatarToken :address="currency.address[1]" size="18" />

            <small class="leading-none text-skin-heading text-base">{{
              currency.code
            }}</small>
            <span
              v-if="currencyId === data.currency"
              class="absolute right-0 pr-3"
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
        <div class="flex gap-2 items-center">
          <AvatarToken
            :address="CURRENCIES[data.currency].address[1]"
            size="28"
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
        class="px-5"
        @click.prevent="pay"
      >
        Pay
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
  <ModalWrongNetwork
    :open="modalUnsupportedNetworkOpen"
    @close="modalUnsupportedNetworkOpen = false"
    @network-changed="pay"
  />
</template>
