const shortUrls = ref<string[]>([]);

export function useShortUrls() {
  async function getShortUrls(): Promise<string[]> {
    const response = await fetch(
      'https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/master/list'
    );
    const data = await response.text();
    const lines = data.split('\n');
    const urls = lines.filter(
      line => !line.startsWith('#') && line.trim() !== ''
    );
    return urls;
  }

  onMounted(async () => {
    if (shortUrls.value.length === 0) shortUrls.value = await getShortUrls();
  });

  return { shortUrls };
}
