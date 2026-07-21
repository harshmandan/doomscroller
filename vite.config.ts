import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// Disable CSS minification: lightningcss (rolldown-vite's minifier) throws on Tailwind's
	// container queries like `@media (width >= calc(var(--spacing-scale) * 1024))`. The Tailwind
	// plugin already emits lean CSS, so skipping the minify pass costs little.
	build: { cssMinify: false }
});
