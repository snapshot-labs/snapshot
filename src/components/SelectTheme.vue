<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSkin } from '@/composables/useSkin';
const { toggleUserTheme, userTheme } = useSkin();

const isDarkTheme = ref(userTheme.value === 'dark');

watch(isDarkTheme, () => {
  toggleUserTheme();
});
</script>

<template>
  <div class="flex space-x-5">
    <div>
      <svg
        class="cursor-pointer rounded-md border"
        width="150"
        height="108"
        viewBox="0 0 150 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="isDarkTheme = false"
      >
        <g clip-path="url(#clip0_188_3476)">
          <rect x="1" y="1" width="148" height="105.861" rx="4" fill="white" />
          <rect
            width="1"
            height="106"
            transform="translate(18 1)"
            fill="#E0E0E0"
          />
          <rect
            width="131"
            height="1"
            transform="translate(18 18)"
            fill="#E0E0E0"
          />
          <rect x="6" y="6" width="8" height="8" rx="4" fill="#E8B260" />
          <rect x="6" y="18" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="6" y="30" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="25" y="8" width="24" height="4" rx="2" fill="#57606A" />
          <rect x="117" y="8" width="24" height="4" rx="2" fill="#E0E0E0" />
          <rect x="125" y="25" width="16" height="4" rx="2" fill="#E0E0E0" />
          <rect x="25" y="25" width="48" height="4" rx="2" fill="#E0E0E0" />
          <rect x="34" y="38" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="34" y="49" width="8" height="2" rx="1" fill="#111111" />
          <rect x="31" y="56" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="25.5"
            y="33.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="34" y="74" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="34" y="85" width="8" height="2" rx="1" fill="#111111" />
          <rect x="31" y="92" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="25.5"
            y="69.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="64" y="38" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="64" y="49" width="8" height="2" rx="1" fill="#111111" />
          <rect x="61" y="56" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="55.5"
            y="33.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="64" y="74" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="64" y="85" width="8" height="2" rx="1" fill="#111111" />
          <rect x="61" y="92" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="55.5"
            y="69.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="94" y="38" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="94" y="49" width="8" height="2" rx="1" fill="#111111" />
          <rect x="91" y="56" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="85.5"
            y="33.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="94" y="74" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="94" y="85" width="8" height="2" rx="1" fill="#111111" />
          <rect x="91" y="92" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="85.5"
            y="69.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="124" y="38" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="124" y="49" width="8" height="2" rx="1" fill="#111111" />
          <rect x="121" y="56" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="115.5"
            y="33.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="124" y="74" width="8" height="8" rx="4" fill="#57606A" />
          <rect x="124" y="85" width="8" height="2" rx="1" fill="#111111" />
          <rect x="121" y="92" width="14" height="4" rx="2" fill="#E0E0E0" />
          <rect
            x="115.5"
            y="69.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="#E0E0E0"
          />
          <rect x="75" y="25" width="8" height="4" rx="2" fill="#E0E0E0" />
        </g>

        <defs>
          <clipPath id="clip0_188_3476">
            <rect
              x="1"
              y="1"
              width="148"
              height="105.861"
              rx="4"
              fill="white"
            />
          </clipPath>
        </defs>
      </svg>
      <InputRadio
        :model-value="!isDarkTheme"
        name="light"
        label="Light"
        class="mt-2"
        @update:model-value="isDarkTheme = false"
      />
    </div>
    <div>
      <svg
        class="cursor-pointer rounded-md border"
        width="148"
        height="106"
        viewBox="0 0 148 106"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="isDarkTheme = true"
      >
        <g clip-path="url(#clip0_188_3525)">
          <rect width="148" height="105.861" rx="4" fill="#1C1B20" />
          <rect
            width="1"
            height="106"
            transform="translate(17)"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            width="130"
            height="1"
            transform="translate(18 17)"
            fill="white"
            fill-opacity="0.15"
          />
          <rect x="5" y="5" width="8" height="8" rx="4" fill="#E8B260" />
          <rect x="5" y="17" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="5" y="29" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="24" y="7" width="24" height="4" rx="2" fill="#8B949E" />
          <rect
            x="116"
            y="7"
            width="24"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="124"
            y="24"
            width="16"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="24"
            y="24"
            width="48"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect x="33" y="37" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="33" y="48" width="8" height="2" rx="1" fill="white" />
          <rect
            x="30"
            y="55"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="24.5"
            y="32.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="33" y="73" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="33" y="84" width="8" height="2" rx="1" fill="white" />
          <rect
            x="30"
            y="91"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="24.5"
            y="68.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="63" y="37" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="63" y="48" width="8" height="2" rx="1" fill="white" />
          <rect
            x="60"
            y="55"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="54.5"
            y="32.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="63" y="73" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="63" y="84" width="8" height="2" rx="1" fill="white" />
          <rect
            x="60"
            y="91"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="54.5"
            y="68.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="93" y="37" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="93" y="48" width="8" height="2" rx="1" fill="white" />
          <rect
            x="90"
            y="55"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="84.5"
            y="32.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="93" y="73" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="93" y="84" width="8" height="2" rx="1" fill="white" />
          <rect
            x="90"
            y="91"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="84.5"
            y="68.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="123" y="37" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="123" y="48" width="8" height="2" rx="1" fill="white" />
          <rect
            x="120"
            y="55"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="114.5"
            y="32.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect x="123" y="73" width="8" height="8" rx="4" fill="#8B949E" />
          <rect x="123" y="84" width="8" height="2" rx="1" fill="white" />
          <rect
            x="120"
            y="91"
            width="14"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
          <rect
            x="114.5"
            y="68.5"
            width="25"
            height="31"
            rx="1.5"
            stroke="white"
            stroke-opacity="0.15"
          />
          <rect
            x="74"
            y="24"
            width="8"
            height="4"
            rx="2"
            fill="white"
            fill-opacity="0.15"
          />
        </g>

        <defs>
          <clipPath id="clip0_188_3525">
            <rect width="148" height="105.861" rx="4" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <InputRadio
        :model-value="isDarkTheme"
        name="dark"
        label="Dark"
        class="mt-2"
        @update:model-value="isDarkTheme = true"
      />
    </div>
  </div>
</template>
