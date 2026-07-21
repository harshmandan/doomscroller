import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Static site for GitHub Pages. SPA fallback since the app is client-rendered (ssr = false).
		adapter: adapter({ fallback: '404.html' }),
		paths: {
			// Served from https://harshmandan.github.io/doomscroller/ — set BASE_PATH=/doomscroller in CI.
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;
