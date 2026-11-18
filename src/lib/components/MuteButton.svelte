<script lang="ts">
	let { muted, ontoggle }: { muted: boolean; ontoggle: () => void } = $props();
</script>

<button class="rounded-4 border-0 bg-black/55 px-12 py-8 text-14 text-white" onclick={ontoggle}>
	{muted ? 'Unmute' : 'Mute'}
</button>
