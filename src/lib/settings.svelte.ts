import { browser } from '$app/environment';

export const POOL_SIZES = [1, 3, 5, 7] as const;
export const PRELOADS = ['none', 'manifest', 'full'] as const;

/** The API writes this many shuffles per scope. */
export const SHUFFLES = 10;
/** Stored when the user wants every tile, whatever the pattern holds. */
export const FEED_SIZE_ALL = 500;

export type Preload = (typeof PRELOADS)[number];

export type Settings = {
	/** Scale of the tile that is leaving, 0.5 to 1. */
	outScale: number;
	/** Scale of the tile that is arriving, 0.5 to 1. */
	inScale: number;
	/** Corner radius in px while a tile is in transit. */
	radius: number;
	/** Share of the scroll, in percent, that the zoom takes. */
	zoomDistance: number;
	/** How many video elements exist at once. */
	poolSize: number;
	/** What a tile loads before it becomes the current one. */
	preload: Preload;
	/** How much of the next tile, in percent, must be on screen before it takes over. */
	switchPoint: number;
	/** Which kind of clip the feed shows: a pattern name from the API, or 'all'. */
	pattern: string;
	/** Most tiles in the feed. */
	feedSize: number;
	/** Which of the API's pre-shuffled orders to use, 1 to SHUFFLES. */
	shuffle: number;
};

export const DEFAULTS: Settings = {
	outScale: 0.9,
	inScale: 0.9,
	radius: 28,
	zoomDistance: 30,
	poolSize: 3,
	preload: 'full',
	switchPoint: 35,
	pattern: 'all',
	feedSize: FEED_SIZE_ALL,
	shuffle: 1
};

const KEY = 'doomscroller:settings';

function clamp(value: unknown, min: number, max: number, fallback: number): number {
	return typeof value === 'number' && Number.isFinite(value)
		? Math.min(max, Math.max(min, value))
		: fallback;
}

function read(): Settings {
	if (!browser) return { ...DEFAULTS };
	let saved: Partial<Settings> = {};
	try {
		saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {};
	} catch {
		/* storage blocked or bad JSON: use defaults */
	}
	return {
		outScale: clamp(saved.outScale, 0.5, 1, DEFAULTS.outScale),
		inScale: clamp(saved.inScale, 0.5, 1, DEFAULTS.inScale),
		radius: clamp(saved.radius, 0, 64, DEFAULTS.radius),
		zoomDistance: clamp(saved.zoomDistance, 5, 100, DEFAULTS.zoomDistance),
		poolSize: POOL_SIZES.includes(saved.poolSize as never) ? saved.poolSize! : DEFAULTS.poolSize,
		preload: PRELOADS.includes(saved.preload as never) ? saved.preload! : DEFAULTS.preload,
		switchPoint: clamp(saved.switchPoint, 10, 90, DEFAULTS.switchPoint),
		// the pattern name is checked against the API when the feed loads
		pattern: typeof saved.pattern === 'string' ? saved.pattern : DEFAULTS.pattern,
		feedSize: Math.round(clamp(saved.feedSize, 1, FEED_SIZE_ALL, DEFAULTS.feedSize)),
		shuffle: Math.round(clamp(saved.shuffle, 1, SHUFFLES, DEFAULTS.shuffle))
	};
}

export const settings = $state<Settings>(read());

export function saveSettings() {
	const json = JSON.stringify(settings);
	try {
		localStorage.setItem(KEY, json);
	} catch {
		/* storage blocked: settings last for this visit only */
	}
}

export function resetSettings() {
	Object.assign(settings, DEFAULTS);
}

/** Whether the tile zoom can run in this browser. Mirrors the guards in custom.css. */
export const scrollAnimation = {
	supported: browser && CSS.supports('animation-timeline: view()'),
	reducedMotion: browser && matchMedia('(prefers-reduced-motion: reduce)').matches
};
