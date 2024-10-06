<script lang="ts">
	import { formatTime } from '$lib/format';

	let {
		title,
		author,
		readyState,
		duration,
		t
	}: {
		title: string;
		author: string;
		readyState: number;
		duration: number;
		t: number;
	} = $props();

	const ready = $derived(readyState >= 3 && Number.isFinite(duration) && duration > 0);
</script>

<div
	class="absolute right-16 bottom-32 left-16 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
>
	<p class="font-600">{title}</p>
	<div class="mt-4 flex items-baseline justify-between gap-12">
		<p class="text-14 opacity-85">{author}</p>
		<p class="text-12 tabular-nums opacity-70">
			{#if ready}{formatTime(t)}/{formatTime(duration)}{:else}---{/if}
		</p>
	</div>
</div>
