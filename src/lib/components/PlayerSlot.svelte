<script lang="ts">
	import {
		canPlayNativeHls,
		hlsErrorMessage,
		loadHls,
		nativeErrorMessage,
		type HlsInstance
	} from '$lib/hls';
	import type { FeedItem } from '$lib/feed';
	import LoadingOverlay from './LoadingOverlay.svelte';
	import ErrorOverlay from './ErrorOverlay.svelte';
	import SlotMeta from './SlotMeta.svelte';

	let {
		item,
		active,
		muted,
		slotIndex
	}: {
		item: FeedItem | undefined;
		active: boolean;
		muted: boolean;
		slotIndex: number;
	} = $props();

	let video = $state<HTMLVideoElement | null>(null);
	let paused = $state(true);
	let t = $state(0);
	let duration = $state(0);
	let readyState = $state(0);
	let error = $state<string | null>(null);
	let hls: HlsInstance | null = null;
	let boundUrl: string | null = null;

	$effect(() => {
		const url = item?.url;
		const v = video;
		if (!url || !v || boundUrl === url) return;

		hls?.destroy();
		hls = null;
		boundUrl = url;
		error = null;

		v.onerror = () => {
			if (boundUrl !== url) return;
			error = nativeErrorMessage(v.error?.code);
		};

		if (canPlayNativeHls()) {
			v.src = url;
		} else {
			loadHls().then((Hls) => {
				if (boundUrl !== url || !video) return;
				const instance = new Hls({ autoStartLoad: false });
				instance.on(Hls.Events.ERROR, (_evt, data) => {
					if (!data.fatal || boundUrl !== url) return;
					error = hlsErrorMessage(data.type);
				});
				instance.attachMedia(video);
				instance.loadSource(url);
				instance.startLoad(0);
				hls = instance;
			});
		}
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

<article
	class="pointer-events-none absolute inset-x-0 top-0 h-dvh will-change-transform"
	style="transform: translateY({slotIndex * 100}dvh)"
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
