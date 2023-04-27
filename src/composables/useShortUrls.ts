const shortUrls = ref<string[]>([]);

export function useShortUrls() {
  async function fetchShortUrlData(): Promise<string> {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/master/list'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error: any) {
      console.error(`Error fetching short URLs: ${error.message}`);
      return '';
    }
  }

  function parseShortUrlData(data: string): string[] {
    const lines = data.split('\n');

    return lines.filter(line => !line.startsWith('#') && line.trim() !== '');
  }

  async function getShortUrls(): Promise<string[]> {
    const rawData = await fetchShortUrlData();
    return parseShortUrlData(rawData);
  }

  function containsShortUrl(text: string): boolean {
    if (shortUrls.value.length === 0) return false;
    return shortUrls.value.some(
      shortUrl =>
        text.includes(`http://${shortUrl}/`) ||
        text.includes(`https://${shortUrl}/`) ||
        text.includes(`.${shortUrl}/`)
    );
  }

  onMounted(async () => {
    if (shortUrls.value.length === 0) shortUrls.value = await getShortUrls();
  });

  return { containsShortUrl };
}
