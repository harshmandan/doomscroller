import { generateFeed } from '$lib/feed';
import type { PageLoad } from './$types';

export const ssr = false;

// Prerender the empty SPA shell so GitHub Pages serves "/" as a real index.html (HTTP 200).
// Deep links like /5 are handled client-side via the 404.html fallback.
export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const feed = generateFeed();
	const parsed = params.id ? parseInt(params.id, 10) : 1;
	const safe = Number.isFinite(parsed) ? parsed : 1;
	const initialIndex = Math.min(Math.max(0, safe - 1), feed.length - 1);
	return { feed, initialIndex };
};
