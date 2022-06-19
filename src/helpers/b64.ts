/// URL-safe Base64 encoding and decoding.

const B64U_LOOKUP = {
  '/': '_',
  _: '/',
  '+': '-',
  '-': '+',
  '=': '.',
  '.': '='
};

export const encode = str =>
  btoa(str).replace(/(\+|\/|=)/g, m => B64U_LOOKUP[m]);

export const decode = str =>
  atob(str.replace(/(-|_|\.)/g, m => B64U_LOOKUP[m]));

export const encodeJson = json => encode(JSON.stringify(json));
export const decodeJson = str => JSON.parse(decode(str));
