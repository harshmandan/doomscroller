export type FeedItem = {
	id: number;
	title: string;
	author: string;
	url: string;
};

// Generated clips from https://github.com/harshmandan/hls-demo-streams.
// A fixed shuffle (not a random one) keeps deep links like /5 on the same clip.
const FEED_URL = 'https://harshmandan.github.io/hls-demo-streams/api/random/1.json';

type Stream = { title: string; pattern: string; url: string };

export async function loadFeed(fetch: typeof globalThis.fetch): Promise<FeedItem[]> {
	const res = await fetch(FEED_URL);
	if (!res.ok) throw new Error(`Feed request failed with status ${res.status}`);
	const { streams } = (await res.json()) as { streams: Stream[] };
	return streams.map((s, i) => ({
		id: i + 1,
		title: s.title,
		author: `@${s.pattern}`,
		url: s.url
	}));
}
