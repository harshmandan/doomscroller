<script lang="ts">
	/** Number of feed tiles. The skull bites once per tile scrolled. */
	let { tiles }: { tiles: number } = $props();
</script>

<h1
	class="pointer-events-none fixed top-16 left-16 z-10 m-0 flex items-center gap-8 rounded-4 bg-black/55 px-12 py-8 text-white"
	style:--bites={Math.max(1, tiles)}
>
	<!-- One SVG unit is one pixel of the skull. crispEdges keeps the squares hard. -->
	<svg
		class="skull h-20 w-auto overflow-visible"
		viewBox="0 0 11 11"
		shape-rendering="crispEdges"
		aria-hidden="true"
	>
		<g fill="currentColor">
			<rect x="2" y="0" width="7" height="1" />
			<rect x="1" y="1" width="9" height="1" />
			<rect x="0" y="2" width="11" height="5" />
			<rect x="1" y="7" width="9" height="1" />
			<!-- upper teeth -->
			<rect x="2" y="8" width="1" height="1" />
			<rect x="4" y="8" width="1" height="1" />
			<rect x="6" y="8" width="1" height="1" />
			<rect x="8" y="8" width="1" height="1" />
		</g>
		<g class="eyes">
			<rect x="2" y="4" width="2" height="2" />
			<rect x="7" y="4" width="2" height="2" />
		</g>
		<rect x="5" y="6" width="1" height="1" fill="#000" />
		<g class="jaw" fill="currentColor">
			<rect x="3" y="9" width="1" height="1" />
			<rect x="5" y="9" width="1" height="1" />
			<rect x="7" y="9" width="1" height="1" />
			<rect x="2" y="10" width="7" height="1" />
		</g>
	</svg>

	<span class="wordmark hidden font-mono text-14 font-700 tracking-[0.14em] uppercase 640:inline">
		<span class="text-red">Doom</span>scroller
	</span>
</h1>

<style>
	.eyes {
		fill: #000;
	}

	.wordmark {
		text-shadow: 2px 2px 0 #000;
	}

	@keyframes bite {
		50% {
			transform: translateY(2px);
		}
	}

	@keyframes glare {
		50% {
			fill: #f00;
		}
	}

	/* The feed element names its scroll timeline --feed. Each iteration spans one tile,
	   so the jaw drops and the eyes go red mid-swipe, then settle when a tile snaps. */
	@supports (animation-timeline: scroll()) {
		@media (prefers-reduced-motion: no-preference) {
			.jaw,
			.eyes {
				animation: linear both;
				animation-iteration-count: var(--bites);
				animation-timeline: --feed;
			}

			.jaw {
				animation-name: bite;
				/* whole-pixel steps, like a sprite */
				animation-timing-function: steps(2, jump-none);
			}

			.eyes {
				animation-name: glare;
			}
		}
	}
</style>
