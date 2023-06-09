import { LensClient, development, production } from '@lens-protocol/client';

export const lensClient = new LensClient({
  environment: import.meta.env.PROD ? production : development
});
