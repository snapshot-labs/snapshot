import { randomBytes } from '@ethersproject/random';
import { BigNumber } from '@ethersproject/bignumber';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import shutterWasm from '@shutter-network/shutter-crypto/dist/shutter-crypto.wasm?url';
import { init, encrypt } from '@shutter-network/shutter-crypto';

export default async function encryptChoice(
  choice: string,
  id: string
): Promise<string | null> {
  await init(shutterWasm);

  const bytesChoice = toUtf8Bytes(choice);
  const message = arrayify(bytesChoice);
  const eonPublicKey = arrayify(import.meta.env.VITE_SHUTTER_EON_PUBKEY);
  const proposalId = arrayify(id);
  const sigma = arrayify(BigNumber.from(randomBytes(32)));

  const encryptedMessage = await encrypt(
    message,
    eonPublicKey,
    proposalId,
    sigma
  );

  return hexlify(encryptedMessage) ?? null;
}
