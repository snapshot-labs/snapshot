import Vue from 'vue';
import { LockPlugin } from '@bonustrack/lock/plugins/vue';
import injected from '@bonustrack/lock/connectors/injected';
import fortmatic from '@bonustrack/lock/connectors/fortmatic';
import portis from '@bonustrack/lock/connectors/portis';
import walletconnect from '@bonustrack/lock/connectors/walletconnect';
import walletlink from '@bonustrack/lock/connectors/walletlink';
import config from '@/helpers/config';

const options: any = { connectors: [] };
const connectors = { injected, fortmatic, portis, walletconnect, walletlink };

Object.entries(config.connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: connectors[connector[0]],
    options: connector[1].options
  });
});

Vue.use(LockPlugin, options);
