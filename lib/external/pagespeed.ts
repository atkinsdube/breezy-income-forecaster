export async function fetchPageSpeedSignals(websiteUrl?: string) {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey || !websiteUrl) {
    return { pagespeedScore: null };
  }

  try {
    const encoded = encodeURIComponent(websiteUrl);
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encoded}&key=${apiKey}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const score = data?.lighthouseResult?.categories?.performance?.score;

    return {
      pagespeedScore: typeof score === 'number' ? Math.round(score * 100) : null,
    };
  } catch {
    return { pagespeedScore: null };
  }
}
