import { generateFeed } from '$lib/feed';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const feed = generateFeed();
	const parsed = params.id ? parseInt(params.id, 10) : 1;
	const safe = Number.isFinite(parsed) ? parsed : 1;
	const initialIndex = Math.min(Math.max(0, safe - 1), feed.length - 1);
	return { feed, initialIndex };
};
