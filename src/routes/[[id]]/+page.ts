import { error } from '@sveltejs/kit';
import { loadFeed, loadPatterns } from '$lib/feed';
import { settings } from '$lib/settings.svelte';
import type { PageLoad } from './$types';

export const ssr = false;

// Prerender the empty SPA shell so GitHub Pages serves "/" as a real index.html (HTTP 200).
// Deep links like /5 are handled client-side via the 404.html fallback.
export const prerender = true;

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const patterns = await loadPatterns(fetch);
		// a saved pattern may have been removed from the API since
		if (!patterns.some((p) => p.name === settings.pattern)) settings.pattern = 'all';

		const { feed, total } = await loadFeed(fetch, {
			pattern: settings.pattern,
			shuffle: settings.shuffle,
			limit: settings.feedSize
		});
		const parsed = params.id ? parseInt(params.id, 10) : 1;
		const safe = Number.isFinite(parsed) ? parsed : 1;
		const initialIndex = Math.min(Math.max(0, safe - 1), feed.length - 1);
		return { feed, total, patterns, initialIndex };
	} catch {
		error(503, 'Could not load the video feed');
	}
};
