import { ERC20ABI } from '@/helpers/constants';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';

export async function sendApprovalTransaction(
  provider: any,
  token: string,
  contract: string,
  amount: string
) {
  const approveTx = await sendTransaction(
    provider,
    token,
    ERC20ABI,
    'approve',
    [contract, amount],
    {}
  );

  return approveTx.wait(1);
}
