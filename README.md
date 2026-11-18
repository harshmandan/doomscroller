# doomscroller

A TikTok-style vertical video feed built with SvelteKit, native CSS scroll-snap, and a 3-element HLS player pool.

## Architecture

The scroll container holds two parallel layers:

- **Snap rail** - N empty `100dvh` divs, one per feed item. These define scroll length and act as `scroll-snap-align: start` targets. Each is essentially free.
- **Video pool** - 3 absolutely-positioned `<video>` elements by default, repositioned via `top`. A CSS scroll-driven animation (`animation-timeline: view()`) shrinks each tile to 90% with rounded corners while it scrolls and restores it when snapped; browsers without support skip the effect. As you scroll, the off-screen slot reassigns its `boundIndex` to the next feed index and hls.js swaps its source. The video DOM node persists across reassignments, so the HLS attachment never re-mounts.
- **Settings** - the Settings button opens a panel to tune the feed live: outgoing and incoming tile scale, corner radius, zoom distance, pool size (1, 3, 5, 7), how eagerly neighbours preload (off, playlist only, full), the scroll point where the next tile takes over, and which clips the feed shows (pattern, total tiles, shuffle order, from the [hls-demo-streams](https://github.com/harshmandan/hls-demo-streams) API). Values persist in `localStorage`. The animation controls are disabled, with a note, where scroll-driven animations are unsupported or reduced motion is on.

Current slide is detected from `scrollTop / clientHeight` in a `requestAnimationFrame` loop. URL syncs via SvelteKit's `replaceState` (shallow - no load re-runs). iOS Safari uses native HLS; everything else uses hls.js over MSE.

## Performance

- **Feed length** - DOM cost is one empty div per item. Smooth up to **10,000 items** in the rail; the bottleneck is RAM (~6KB per 1k items), not paint.
- **Memory** - three concurrent HLS buffers cap around 30MB. Decoder slots stay under iOS Safari's ~4-element ceiling.
- **Cold start** - first slide paints with no HLS init cost via native playback on iOS, or via lazy hls.js import on Android.

Verified smooth on:

- iPhone SE (2nd gen)
- Samsung Galaxy A13 - Exynos 850
- Redmi Note 8 - Snapdragon 665
- Moto G Power - Helio G37

## Develop

```sh
pnpm install
pnpm dev
```
