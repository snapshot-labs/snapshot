import { create } from 'kubo-rpc-client';
import { pin } from '@snapshot-labs/pineapple';

const client = create({ url: 'https://api.thegraph.com/ipfs/api/v0' });

export async function pinGraph(payload: any) {
  const res = await client.add(JSON.stringify(payload), { pin: true });

  return {
    provider: 'graph',
    cid: res.cid.toV0().toString()
  };
}

export async function pinPineapple(payload: any) {
  const pinned = await pin(payload);
  if (!pinned) throw new Error('Failed to pin');

  return {
    provider: pinned.provider,
    cid: pinned.cid
  };
}
