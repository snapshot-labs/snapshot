import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

export async function call(
  provider: any,
  abi: any[],
  call: any[],
  options?: any
) {
  const contract = new Contract(call[0], abi, provider);
  try {
    const params = call[2] || [];
    return await contract[call[1]](...params, options || {});
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function multicall(
  network: string,
  provider: any,
  abi: any[],
  calls: any[],
  options?: any
) {
  const multicallAbi = [
    'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'
  ];
  const multi = new Contract(
    networks[network].multicall,
    multicallAbi,
    provider
  );
  const itf = new Interface(abi);
  try {
    const max = options?.limit || 500;
    const pages = Math.ceil(calls.length / max);
    const promises: any = [];
    Array.from(Array(pages)).forEach((x, i) => {
      const callsInPage = calls.slice(max * i, max * (i + 1));
      promises.push(
        multi.aggregate(
          callsInPage.map(call => [
            call[0].toLowerCase(),
            itf.encodeFunctionData(call[1], call[2])
          ]),
          options || {}
        )
      );
    });
    let results: any = await Promise.all(promises);
    results = results.reduce((prev: any, [, res]: any) => prev.concat(res), []);
    return results.map((call, i) =>
      itf.decodeFunctionResult(calls[i][1], call)
    );
  } catch (e) {
    return Promise.reject(e);
  }
}
