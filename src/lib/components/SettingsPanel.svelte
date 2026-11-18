<script lang="ts">
	import type { FeedPattern } from '$lib/feed';
	import {
		FEED_SIZE_ALL,
		POOL_SIZES,
		PRELOADS,
		resetSettings,
		scrollAnimation,
		settings,
		SHUFFLES,
		type Settings
	} from '$lib/settings.svelte';

	let {
		patterns,
		total,
		onfeedchange,
		onclose
	}: {
		/** The patterns the streams API offers. */
		patterns: FeedPattern[];
		/** How many clips the current pattern has. */
		total: number;
		/** Called after a feed setting changes. The page reloads the feed. */
		onfeedchange: () => void;
		onclose: () => void;
	} = $props();

	const feedDefaults = { pattern: 'all', feedSize: FEED_SIZE_ALL, shuffle: 1 };

	// Held locally while dragging. It is saved on release, since saving reloads the feed.
	// svelte-ignore state_referenced_locally
	let feedSize = $state(Math.min(settings.feedSize, total));

	function setPattern(name: string) {
		if (settings.pattern === name) return;
		settings.pattern = name;
		onfeedchange();
	}

	function commitFeedSize() {
		settings.feedSize = feedSize >= total ? FEED_SIZE_ALL : feedSize;
		onfeedchange();
	}

	function reshuffle() {
		// step by 1 to SHUFFLES - 1 so the order always changes
		const step = 1 + Math.floor(Math.random() * (SHUFFLES - 1));
		settings.shuffle = ((settings.shuffle - 1 + step) % SHUFFLES) + 1;
		onfeedchange();
	}

	function reset() {
		const feedChanged =
			settings.pattern !== feedDefaults.pattern ||
			settings.feedSize !== feedDefaults.feedSize ||
			settings.shuffle !== feedDefaults.shuffle;
		resetSettings();
		if (feedChanged) onfeedchange();
	}

	type NumberKey = { [K in keyof Settings]: Settings[K] extends number ? K : never }[keyof Settings];

	const animationOff = !scrollAnimation.supported || scrollAnimation.reducedMotion;

	const percent = (v: number) => `${Math.round(v * 100)}%`;
	const preloadLabels = { none: 'Off', manifest: 'Playlist', full: 'Full' } as const;
	const preloadHelp = {
		none: 'A tile loads nothing until it is the current one. Least data, slowest start.',
		manifest: 'Neighbours fetch only the playlist. Video data waits until the tile is current.',
		full: 'Neighbours buffer video right away. Most data, instant start.'
	} as const;
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

{#snippet range(
	label: string,
	key: NumberKey,
	min: number,
	max: number,
	step: number,
	format: (v: number) => string
)}
	<label class="block">
		<span class="flex justify-between text-14">
			<span>{label}</span>
			<output class="text-white/60 tabular-nums">{format(settings[key])}</output>
		</span>
		<input
			type="range"
			{min}
			{max}
			{step}
			bind:value={settings[key]}
			class="mt-4 block w-full accent-white disabled:opacity-40"
		/>
	</label>
{/snippet}

<section
	aria-label="Settings"
	class="pointer-events-auto fixed top-56 right-16 z-10 flex max-h-[calc(100dvh-72px)] w-[20rem] max-w-[calc(100vw-32px)] flex-col gap-20 overflow-y-auto overscroll-contain rounded-12 border border-white/15 bg-black/75 p-16 text-white backdrop-blur-md"
>
	<header class="flex items-center justify-between">
		<h2 class="text-base font-600">Settings</h2>
		<span class="flex gap-8">
			<button class="rounded-4 bg-white/10 px-8 py-4 text-12" onclick={reset}>Reset</button>
			<button class="rounded-4 bg-white/10 px-8 py-4 text-12" onclick={onclose}>Close</button>
		</span>
	</header>

	<fieldset class="m-0 flex min-w-0 flex-col gap-12 border-0 p-0" disabled={animationOff}>
		<legend class="mb-8 p-0 text-12 font-600 tracking-[0.06em] text-white/60 uppercase">
			Scroll animation
		</legend>

		<p
			class="rounded-8 px-8 py-6 text-12 {animationOff
				? 'bg-red/25 text-white'
				: 'bg-white/10 text-white/70'}"
			data-testid="animation-note"
		>
			{#if !scrollAnimation.supported}
				Your browser does not support CSS scroll-driven animations. These controls have no effect
				here. Try a recent Chrome, Edge, or Safari.
			{:else if scrollAnimation.reducedMotion}
				Reduced motion is on in your system settings, so the animation is off.
			{:else}
				Uses CSS scroll-driven animations. Your browser supports them. Scroll the feed to see your
				changes.
			{/if}
		</p>

		{@render range('Outgoing tile scale', 'outScale', 0.5, 1, 0.01, percent)}
		{@render range('Incoming tile scale', 'inScale', 0.5, 1, 0.01, percent)}
		{@render range('Corner radius', 'radius', 0, 64, 1, (v) => `${v}px`)}
		{@render range('Zoom distance', 'zoomDistance', 5, 100, 5, (v) => `${v}% of scroll`)}
	</fieldset>

	<fieldset class="m-0 flex min-w-0 flex-col gap-12 border-0 p-0">
		<legend class="mb-8 p-0 text-12 font-600 tracking-[0.06em] text-white/60 uppercase">
			Loading
		</legend>

		<div>
			<span class="text-14">Active tiles</span>
			<div class="mt-4 grid grid-cols-4 gap-4">
				{#each POOL_SIZES as size (size)}
					<button
						class="rounded-4 py-6 text-14 tabular-nums {settings.poolSize === size
							? 'bg-white text-black'
							: 'bg-white/10'}"
						aria-pressed={settings.poolSize === size}
						onclick={() => (settings.poolSize = size)}
					>
						{size}
					</button>
				{/each}
			</div>
			<p class="mt-4 text-12 text-white/60">
				Video elements kept alive around the current one. iOS Safari allows about 4.
			</p>
		</div>

		<div>
			<span class="text-14">Preload neighbours</span>
			<div class="mt-4 grid grid-cols-3 gap-4">
				{#each PRELOADS as mode (mode)}
					<button
						class="rounded-4 py-6 text-14 {settings.preload === mode
							? 'bg-white text-black'
							: 'bg-white/10'}"
						aria-pressed={settings.preload === mode}
						onclick={() => (settings.preload = mode)}
					>
						{preloadLabels[mode]}
					</button>
				{/each}
			</div>
			<p class="mt-4 text-12 text-white/60">{preloadHelp[settings.preload]}</p>
		</div>

		<div>
			{@render range('Switch point', 'switchPoint', 10, 90, 5, (v) => `${v}%`)}
			<p class="mt-4 text-12 text-white/60">
				How much of the next tile must be on screen before it starts playing.
			</p>
		</div>
	</fieldset>
	<fieldset class="m-0 flex min-w-0 flex-col gap-12 border-0 p-0">
		<legend class="mb-8 p-0 text-12 font-600 tracking-[0.06em] text-white/60 uppercase">
			Feed
		</legend>

		<p class="rounded-8 bg-white/10 px-8 py-6 text-12 text-white/70">
			Clips come from the hls-demo-streams API. A change here reloads the feed from the first tile.
		</p>

		<div>
			<span class="text-14">Clip type</span>
			<div class="mt-4 grid grid-cols-3 gap-4">
				{#each [{ name: 'all' }, ...patterns] as pattern (pattern.name)}
					<button
						class="truncate rounded-4 px-4 py-6 text-12 {settings.pattern === pattern.name
							? 'bg-white text-black'
							: 'bg-white/10'}"
						aria-pressed={settings.pattern === pattern.name}
						onclick={() => setPattern(pattern.name)}
					>
						{pattern.name}
					</button>
				{/each}
			</div>
		</div>

		<label class="block">
			<span class="flex justify-between text-14">
				<span>Total tiles</span>
				<output class="text-white/60 tabular-nums">
					{feedSize >= total ? `all ${total}` : `${feedSize} of ${total}`}
				</output>
			</span>
			<input
				type="range"
				min="1"
				max={total}
				step="1"
				bind:value={feedSize}
				onchange={commitFeedSize}
				class="mt-4 block w-full accent-white"
			/>
		</label>

		<div class="flex items-center justify-between">
			<span class="text-14">
				Order <span class="text-white/60 tabular-nums">{settings.shuffle} of {SHUFFLES}</span>
			</span>
			<button class="rounded-4 bg-white/10 px-12 py-6 text-14" onclick={reshuffle}>Reshuffle</button>
		</div>
	</fieldset>
</section>
