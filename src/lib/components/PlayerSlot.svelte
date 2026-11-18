<script lang="ts">
	import {
		canPlayNativeHls,
		hlsErrorMessage,
		loadHls,
		nativeErrorMessage,
		type HlsInstance
	} from '$lib/hls';
	import type { FeedItem } from '$lib/feed';
	import type { Preload } from '$lib/settings.svelte';
	import LoadingOverlay from './LoadingOverlay.svelte';
	import ErrorOverlay from './ErrorOverlay.svelte';
	import SlotMeta from './SlotMeta.svelte';

	let {
		item,
		active,
		muted,
		slotIndex,
		preload
	}: {
		item: FeedItem | undefined;
		active: boolean;
		muted: boolean;
		slotIndex: number;
		preload: Preload;
	} = $props();

	let video = $state<HTMLVideoElement | null>(null);
	let paused = $state(true);
	let t = $state(0);
	let duration = $state(0);
	let readyState = $state(0);
	let error = $state<string | null>(null);
	let hls: HlsInstance | null = null;
	let boundUrl: string | null = null;
	let loadStarted = false;

	// Gives the video element its source, which is what starts the video download.
	// Until then a tile has fetched the playlist at most. hls.js buffers as soon as it has
	// an element, even with autoStartLoad off, so the attach has to wait too.
	function startLoad() {
		if (!video || !boundUrl || loadStarted) return;
		if (canPlayNativeHls()) {
			video.src = boundUrl;
		} else {
			if (!hls) return;
			hls.attachMedia(video);
			hls.startLoad(0);
		}
		loadStarted = true;
	}

	$effect(() => {
		const url = item?.url;
		const v = video;
		if (!url || !v || boundUrl === url) return;

		const startNow = active || preload === 'full';
		const hadSource = loadStarted;
		hls?.destroy();
		hls = null;
		boundUrl = null;
		loadStarted = false;
		error = null;

		// Not loading yet: clear the last clip so the tile does not show a stale frame.
		if (hadSource && !startNow && canPlayNativeHls()) {
			v.removeAttribute('src');
			v.load();
		}

		// With preload off, a tile stays empty until it is the current one.
		if (!active && preload === 'none') return;

		boundUrl = url;
		v.onerror = () => {
			if (boundUrl !== url) return;
			error = nativeErrorMessage(v.error?.code);
		};

		if (canPlayNativeHls()) {
			// "manifest" mode: fetch the playlist into the HTTP cache and leave the element alone
			if (startNow) startLoad();
			else fetch(url).catch(() => {});
			if (active) v.play().catch(() => {});
		} else {
			loadHls().then((Hls) => {
				if (boundUrl !== url || !video) return;
				const instance = new Hls({ autoStartLoad: false });
				instance.on(Hls.Events.ERROR, (_evt, data) => {
					if (!data.fatal || boundUrl !== url) return;
					error = hlsErrorMessage(data.type);
				});
				instance.loadSource(url);
				hls = instance;
				if (active || preload === 'full') startLoad();
				// attaching resets the element, which drops a play() made before it
				if (active) video.play().catch(() => {});
			});
		}
	});

	$effect(() => {
		if (active || preload === 'full') startLoad();
	});

	$effect(() => {
		const v = video;
		if (!v) return;
		if (active) {
			if (v.currentTime > 0) {
				try {
					v.currentTime = 0;
				} catch {
					/* not seekable yet */
				}
			}
			v.play().catch(() => {});
		} else {
			v.pause();
		}
	});
</script>

<!-- Placed with `top`, not `transform`: the tile-zoom view timeline ignores transforms. -->
<article
	class="tile-zoom pointer-events-none absolute inset-x-0 h-dvh will-change-transform"
	style="top: {slotIndex * 100}dvh"
>
	<video
		bind:this={video}
		{muted}
		bind:paused
		bind:currentTime={t}
		bind:duration
		bind:readyState
		playsinline
		loop
		class="block h-full w-full bg-black object-cover"
	></video>

	{#if error}
		<ErrorOverlay message={error} />
	{:else if readyState < 3}
		<LoadingOverlay />
	{/if}

	{#if item}
		<SlotMeta title={item.title} author={item.author} {readyState} {duration} {t} />
	{/if}
</article>
