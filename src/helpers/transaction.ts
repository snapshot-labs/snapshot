import { ERC20ABI } from '@/helpers/constants';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';

export function sendApprovalTransaction(
  provider: any,
  token: string,
  contract: string,
  amount: string
) {
  return sendTransaction(
    provider,
    token,
    ERC20ABI,
    'approve',
    [contract, amount],
    {}
  );
}
