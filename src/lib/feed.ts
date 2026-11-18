export type FeedItem = {
	id: number;
	title: string;
	author: string;
	url: string;
};

export type FeedPattern = { name: string; count: number };

export type FeedQuery = {
	/** A pattern name from the API, or 'all'. */
	pattern: string;
	/** Which of the API's pre-shuffled lists to use, from 1. */
	shuffle: number;
	/** Most tiles to show. */
	limit: number;
};

// Generated clips from https://github.com/harshmandan/hls-demo-streams.
// The API's shuffles are fixed files, so deep links like /5 stay on the same clip
// until the feed settings change.
const API = 'https://harshmandan.github.io/hls-demo-streams/api';

type Stream = { title: string; pattern: string; url: string };

async function getJson<T>(fetch: typeof globalThis.fetch, path: string): Promise<T> {
	const res = await fetch(`${API}/${path}`);
	if (!res.ok) throw new Error(`${path} failed with status ${res.status}`);
	return res.json();
}

export async function loadPatterns(fetch: typeof globalThis.fetch): Promise<FeedPattern[]> {
	const { patterns } = await getJson<{ patterns: FeedPattern[] }>(fetch, 'patterns.json');
	return patterns.map(({ name, count }) => ({ name, count }));
}

/** Returns the tiles to show, plus how many the chosen pattern has in total. */
export async function loadFeed(
	fetch: typeof globalThis.fetch,
	{ pattern, shuffle, limit }: FeedQuery
): Promise<{ feed: FeedItem[]; total: number }> {
	const scope = pattern === 'all' ? '' : `${pattern}/`;
	const { streams } = await getJson<{ streams: Stream[] }>(fetch, `random/${scope}${shuffle}.json`);
	const feed = streams.slice(0, limit).map((s, i) => ({
		id: i + 1,
		title: s.title,
		author: `@${s.pattern}`,
		url: s.url
	}));
	return { feed, total: streams.length };
}
