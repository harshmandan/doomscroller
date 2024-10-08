<script lang="ts">
	let { index }: { index: number } = $props();
</script>

<div class="relative h-dvh snap-start snap-always" data-index={index}>
	<span
		class="absolute top-16 left-16 rounded-4 bg-black/50 px-8 py-4 text-14 tabular-nums text-white"
	>
		{index + 1}
	</span>
</div>
