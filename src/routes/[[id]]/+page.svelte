<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EndSlide from '$lib/components/EndSlide.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import MuteButton from '$lib/components/MuteButton.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import PlayerSlot from '$lib/components/PlayerSlot.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { computeWindow, makeSlots, reassign, type Slot } from '$lib/pool';
	import { saveSettings, settings } from '$lib/settings.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const feed = data.feed;
	// svelte-ignore state_referenced_locally
	let currentIndex = $state(data.initialIndex);
	let globalMuted = $state(true);
	// A feed change reloads the page. This reopens the panel after it.
	const REOPEN_KEY = 'doomscroller:settings-open';
	let settingsOpen = $state(browser && sessionStorage.getItem(REOPEN_KEY) === '1');
	if (browser) sessionStorage.removeItem(REOPEN_KEY);

	// The page is built around one fixed feed, so a new feed means a fresh load from slide 1.
	function reloadFeed() {
		saveSettings();
		sessionStorage.setItem(REOPEN_KEY, '1');
		location.assign(resolve('/[[id]]', { id: '' }));
	}
	let feedEl = $state<HTMLElement | null>(null);
	let routerReady = $state(false);

	// svelte-ignore state_referenced_locally
	let slots = $state<Slot[]>(
		makeSlots(computeWindow(data.initialIndex, feed.length, settings.poolSize))
	);

	const visibleWindow = $derived(computeWindow(currentIndex, feed.length, settings.poolSize));

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
				Math.min(feed.length, Math.floor(progress + 1 - settings.switchPoint / 100))
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
		const url = resolve('/[[id]]', { id: String(currentIndex + 1) });
		if (url !== window.location.pathname) {
			try {
				replaceState(url, {});
			} catch (err) {
				console.error('[doomscroller] replaceState failed', err);
			}
		}
	});

	$effect(() => reassign(slots, visibleWindow));

	$effect(saveSettings);
</script>

<main
	bind:this={feedEl}
	class="hide-scrollbar fixed inset-0 snap-y snap-mandatory touch-pan-y overflow-y-scroll overscroll-contain bg-black"
	style:scroll-timeline="--feed block"
	style:--tile-out-scale={settings.outScale}
	style:--tile-in-scale={settings.inScale}
	style:--tile-radius="{settings.radius}px"
	style:--tile-zoom-distance="{settings.zoomDistance}%"
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
			preload={settings.preload}
		/>
	{/each}

	<Logo tiles={feed.length} />

	<div class="fixed top-16 right-16 z-10 flex gap-8">
		<span class="rounded-4 bg-black/55 px-12 py-8 text-14 text-white tabular-nums" data-testid="counter">
			{Math.min(currentIndex + 1, feed.length)}/{feed.length}
		</span>
		<button
			class="rounded-4 border-0 bg-black/55 px-12 py-8 text-14 text-white"
			aria-expanded={settingsOpen}
			onclick={() => (settingsOpen = !settingsOpen)}
		>
			Settings
		</button>
		<MuteButton muted={globalMuted} ontoggle={() => (globalMuted = !globalMuted)} />
	</div>

	{#if settingsOpen}
		<SettingsPanel
			patterns={data.patterns}
			total={data.total}
			onfeedchange={reloadFeed}
			onclose={() => (settingsOpen = false)}
		/>
	{/if}
</main>
