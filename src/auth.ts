import Vue from 'vue';
import { LockPlugin, ZilPay as zlp } from '@/helpers/plugins/LockPlugin';

import config from '@/helpers/config';

const options: any = { connectors: [] };
const connectors = { zlp };

Object.entries(config.connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: connectors[connector[0]],
    options: connector[1].options
  });
});

Vue.use(LockPlugin, options);
