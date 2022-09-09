import {
  FormatTypes,
  Fragment,
  FunctionFragment,
  Interface,
  JsonFragment
} from '@ethersproject/abi';

export const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api',
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

export type ABI = string | Array<Fragment | JsonFragment | string>;

export function isArrayParameter(parameter: string): boolean {
  return ['tuple', 'array'].includes(parameter);
}

const fetchContractABI = async (url: string, contractAddress: string) => {
  const params = new URLSearchParams({
    module: 'contract',
    action: 'getAbi',
    address: contractAddress
  });

  // TODO: needs API key or memoization
  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    return { status: 0, result: '' };
  }

  return response.json();
};

export function parseMethodToABI(method: FunctionFragment) {
  return [method.format(FormatTypes.full)];
}

export async function getContractABI(
  network: string,
  contractAddress: string
): Promise<string> {
  const apiUrl = EXPLORER_API_URLS[network];

  if (!apiUrl) {
    console.error(`No explorer URL for network ${network}.`);
    return '';
  }

  try {
    const { result, status } = await fetchContractABI(apiUrl, contractAddress);

    if (status === '0') {
      return '';
    }

    return result;
  } catch (e) {
    console.error('Failed to retrieve ABI', e);
    return '';
  }
}

function isWriteFunction(method: FunctionFragment) {
  if (!method.stateMutability) return true;
  return !['view', 'pure'].includes(method.stateMutability);
}

export function getABIWriteFunctions(abi: string | Fragment[]) {
  const abiInterface = new Interface(abi);
  return (
    abiInterface.fragments
      // Return only contract's functions
      .filter(FunctionFragment.isFunctionFragment)
      .map(FunctionFragment.fromObject)
      // Return only write functions
      .filter(isWriteFunction)
      // Sort by name
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
  );
}

export function getAbiFirstFunctionName(abi: ABI): string {
  const abiInterface = new Interface(abi);
  return abiInterface.fragments[0].name;
}

export async function fetchTextSignatures(
  methodSignature: string
): Promise<string[]> {
  const url = new URL('/api/v1/signatures', 'https://www.4byte.directory');
  url.searchParams.set('hex_signature', methodSignature);
  url.searchParams.set('ordering', 'created_at');
  const response = await fetch(url.toString());
  const { results } = await response.json();
  return results.map(signature => signature.text_signature);
}
