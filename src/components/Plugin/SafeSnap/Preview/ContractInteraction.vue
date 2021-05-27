<template>
  <div class="text-left border rounded-2 p-4 mb-4">
    <div class="mb-2">
      <span class="text-bold"
        >Send {{ formatAmount(transaction.value, 5) }} to:</span
      >
      <div>
        <jazzicon
          :address="transaction.to"
          :diameter="22"
          class="d-inline-block v-align-middle line-height-0"
        />
        &nbsp;<b v-text="_shorten(transaction.to)" />&nbsp;
        <Icon
          v-clipboard:copy="transaction.to"
          v-clipboard:success="handleCopy"
          class="text-gray p-2 mr-n3"
          name="copy"
          size="24"
        />
        <br />
      </div>
    </div>
    <span>Function call:</span><br />
    <span class="text-bold">{{ contractMethod }}</span>
    <div v-if="parameters.length">
      <div v-for="parameter in parameters" :key="parameter.name" class="pl-4">
        <span class="text-bold"
          >{{ parameter.name }} ({{ parameter.type }}):
        </span>
        <span>{{ formatValue(parameter.value, parameter.type) }}</span>
        <Icon
          v-clipboard:copy="formatCopy(parameter.value, parameter.type)"
          v-clipboard:success="handleCopy"
          class="text-gray p-2 mr-n3"
          name="copy"
          size="24"
        />
      </div>
    </div>
    <UiButton v-if="removable" class="width-full mb-2 mt-2" @click="remove">
      Remove
    </UiButton>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { formatAmount } from '@/helpers/utils';
import { Interface } from '@ethersproject/abi';
import {
  isAddress,
  isArrayParameter,
  isByte,
  isInt,
  isUint
} from '@/helpers/validator';

export default {
  props: ['transaction', 'removable'],
  emits: ['remove'],
  data() {
    return {
      contractMethod: '',
      parameters: []
    };
  },
  mounted() {
    const method = this.transaction.abi[0];
    this.contractMethod = method.name;

    const contractInterface = new Interface(this.transaction.abi);
    const methodParametersValues = contractInterface.decodeFunctionData(
      this.contractMethod,
      this.transaction.data
    );

    this.parameters = method.inputs.map(parameter => {
      return {
        name: parameter.name,
        type: parameter.type,
        value: methodParametersValues[parameter.name]
      };
    });
  },
  methods: {
    ...mapActions(['notify']),
    formatAmount,
    handleCopy() {
      this.notify('Copied!');
    },
    formatValue(value, type) {
      if (isArrayParameter(type)) {
        try {
          const rootType = type.replace(/\[]/g, '');
          return JSON.stringify(
            value.map(item => this.formatValue(item, rootType))
          );
        } catch (error) {
          return JSON.stringify(value);
        }
      }
      if (isInt(type) || isUint(type)) {
        return this.formatAmount(value);
      }
      if (isByte(type)) {
        return this._shorten(value, 10);
      }
      if (isAddress(type)) {
        return this._shorten(value);
      }
      return value;
    },
    formatCopy(value, type) {
      if (isArrayParameter(type)) {
        try {
          const rootType = type.replace(/\[]/g, '');
          return JSON.stringify(
            value.map(item => this.formatCopy(item, rootType))
          );
        } catch (error) {
          return JSON.stringify(value);
        }
      }
      if (isInt(type) || isUint(type)) {
        return value.toString();
      }
      return value;
    },
    remove() {
      this.$emit('remove');
    }
  }
};
</script>
