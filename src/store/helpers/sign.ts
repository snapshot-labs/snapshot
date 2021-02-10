// import { keccak256, hexZeroPad, joinSignature } from '@harmony-js/crypto';
// import { strip0x } from '@harmony-js/utils';
//
// import elliptic from 'elliptic';
// const secp256k1 = elliptic.ec('secp256k1');
//
// export function sign(
//   msgText: string | Uint8Array,
//   privateKey: string,
//   prefixMsg = 'Ethereum Signed Message'
// ): string {
//   const data =
//     typeof msgText === 'string' ? Buffer.from(msgText, 'utf8') : msgText;
//
//   const prefix = Buffer.from(
//     `\u0019${prefixMsg}:\n${data.length.toString()}`,
//     'utf-8'
//   );
//
//   const msgHashHarmony = keccak256(Buffer.concat([prefix, data])).slice(2);
//
//   const keyPair = secp256k1.keyFromPrivate(strip0x(privateKey), 'hex');
//
//   const signature = keyPair.sign(msgHashHarmony, { canonical: true });
//
//   const result = {
//     recoveryParam: signature.recoveryParam,
//     r: hexZeroPad('0x' + signature.r.toString(16), 32),
//     s: hexZeroPad('0x' + signature.s.toString(16), 32),
//     v: 27 + signature.recoveryParam
//   };
//
//   return joinSignature(result);
// }
//
// /* Example to use */
//
// const signature = sign(
//   'custom text message or Uint8Array',
//   '1412ac884ccd696b843389e18ff979992fd00e13daa4db9e7869adf1d835ead1'
// );
//
// console.log('signature', signature);
// // 0x62f949a9501c9113618df421af6666c244223d657194f0573a0bd22153638009074190b0e14e81734af3568261da88b563bd3f019fd2edc1cdac5bd10dec9ded1c
