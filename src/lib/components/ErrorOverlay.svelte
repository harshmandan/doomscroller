<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<div
	class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-24 text-center text-white"
>
	<p class="text-base font-600">{message}</p>
	<p class="max-w-320 text-12 opacity-60">
		this test stream may be offline, blocked by mixed-content (https → http), or region-locked.
	</p>
</div>
