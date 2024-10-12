<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate, replaceState } from '$app/navigation';
	import EndSlide from '$lib/components/EndSlide.svelte';
	import MuteButton from '$lib/components/MuteButton.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import PlayerSlot from '$lib/components/PlayerSlot.svelte';
	import { computeWindow, reassign, type Slot } from '$lib/pool';

	const CURRENT_THRESHOLD = 0.35;

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const feed = data.feed;
	// svelte-ignore state_referenced_locally
	let currentIndex = $state(data.initialIndex);
	let globalMuted = $state(true);
	let feedEl = $state<HTMLElement | null>(null);
	let routerReady = $state(false);

	// svelte-ignore state_referenced_locally
	const initialWindow = computeWindow(data.initialIndex, feed.length);
	let slots = $state<Slot[]>([
		{ id: 'a', boundIndex: initialWindow[0] ?? 0 },
		{ id: 'b', boundIndex: initialWindow[1] ?? 0 },
		{ id: 'c', boundIndex: initialWindow[2] ?? 0 }
	]);

	const visibleWindow = $derived(computeWindow(currentIndex, feed.length));

	onMount(() => {
		if (data.initialIndex > 0 && feedEl) {
			feedEl
				.querySelector<HTMLElement>(`[data-index="${data.initialIndex}"]`)
				?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
		}
	});

	afterNavigate(async () => {
		await tick();
		routerReady = true;
	});

	$effect(() => {
		if (!feedEl) return;
		const el = feedEl;
		let raf = 0;
		const compute = () => {
			raf = 0;
			const h = el.clientHeight;
			if (h === 0) return;
			const progress = el.scrollTop / h;
			const target = Math.max(
				0,
				Math.min(feed.length, Math.floor(progress + 1 - CURRENT_THRESHOLD))
			);
			if (target !== currentIndex) currentIndex = target;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(compute);
		};
		el.addEventListener('scroll', onScroll, { passive: true });
		compute();
		return () => {
			el.removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	});

	$effect(() => {
		if (!browser || !routerReady || currentIndex >= feed.length) return;
		const url = `/${currentIndex + 1}`;
		if (url !== window.location.pathname) {
			try {
				replaceState(url, {});
			} catch (err) {
				console.error('[doomscroller] replaceState failed', err);
			}
		}
	});

	$effect(() => reassign(slots, visibleWindow));
</script>

<main
	bind:this={feedEl}
	class="hide-scrollbar fixed inset-0 snap-y snap-mandatory touch-pan-y overflow-y-scroll overscroll-contain bg-black"
>
	{#each feed as item, i (item.id)}
		<Placeholder index={i} />
	{/each}

	<EndSlide />

	{#each slots as slot (slot.id)}
		<PlayerSlot
			item={feed[slot.boundIndex]}
			active={slot.boundIndex === currentIndex}
			muted={globalMuted}
			slotIndex={slot.boundIndex}
		/>
	{/each}

	<MuteButton muted={globalMuted} ontoggle={() => (globalMuted = !globalMuted)} />
</main>
