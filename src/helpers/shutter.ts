import { randomBytes } from '@ethersproject/random';
import { BigNumber } from '@ethersproject/bignumber';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';

const WASM_URL = './both.wasm';

declare global {
  interface Window {
    shcrypto_encrypt: any;
  }
}
declare const Go: any;

let shcryptoWasm;
function init() {
  const go = new Go();
  if ('instantiateStreaming' in WebAssembly) {
    return WebAssembly.instantiateStreaming(
      fetch(WASM_URL),
      go.importObject
    ).then(obj => {
      shcryptoWasm = obj.instance;
      go.run(shcryptoWasm);
    });
  } else {
    return fetch(WASM_URL)
      .then(resp => resp.arrayBuffer())
      .then(bytes =>
        WebAssembly.instantiate(bytes, go.importObject).then(obj => {
          shcryptoWasm = obj.instance;
          go.run(shcryptoWasm);
        })
      );
  }
}

export function encryptChoice(choice: number, id: string): string {
  console.log('ex', hexlify(toUtf8Bytes(id)));
  const message = arrayify(hexlify(choice));
  const eonPublicKey = arrayify(
    '0x0B94B81B1CC392CBD4604EB90E3F4355FA6925D56AC10BBD01E62A9430869B2316F749CAFB20E379BE3AF06701766836A1A0F6A891B090A5789B9BBCEABE3CE40DD32957CBF7EB6775F4BD513A3019EE33CC03568100042F02AC67943680A9DC29AD04AC0A4A4673521A8FC8FEED080977AF44CD23FF7EB4E62E1A11BCC634FC'
  );
  const proposalId = arrayify(id);
  // sigma is a salt value. It should be generated randomly and not be stored since it can be used
  // to decrypt the message.
  const sigma = arrayify(BigNumber.from(randomBytes(32)));

  const encryptedMessage = window.shcrypto_encrypt(
    message,
    eonPublicKey,
    proposalId,
    sigma
  );

  // This key has been generated for above eon key and proposal id.
  const decryptionKey = arrayify(
    '0x219BA688C8505178E50E7E4FEAEFA21BDA69172E71B980A365F6F873DC9B3AAA20076B6D92CB58B24D14B70789A0B37418A0508624C83A7C8E35ED0A8DBB0E4B'
  );
  const decryptedMessage = window.shcrypto_decrypt(
    arrayify(encryptedMessage),
    decryptionKey
  );

  console.log('message:', hexlify(message));
  console.log('encrypted:', encryptedMessage);
  console.log('decrypted:', decryptedMessage);

  return encryptedMessage ?? null;
}

init();
