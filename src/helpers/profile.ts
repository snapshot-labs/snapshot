export async function lookupAddress(
  addresses: string[]
): Promise<{ [k: string]: string }> {
  const results = await fetch(import.meta.env.VITE_STAMP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ method: 'lookup_addresses', params: addresses })
  });

  return (await results.json()).result;
}
