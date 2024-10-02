import type HlsCtor from 'hls.js';

let promise: Promise<typeof HlsCtor> | null = null;

export function loadHls() {
	if (!promise) {
		promise = import('hls.js').then((m) => m.default);
	}
	return promise;
}

let nativeCache: boolean | null = null;

export function canPlayNativeHls(): boolean {
	if (nativeCache !== null) return nativeCache;
	if (typeof document === 'undefined') return false;
	const v = document.createElement('video');
	nativeCache = v.canPlayType('application/vnd.apple.mpegurl') !== '';
	return nativeCache;
}

export type HlsInstance = InstanceType<typeof HlsCtor>;

export function hlsErrorMessage(type: string): string {
	if (type === 'networkError') return 'network error — stream unreachable';
	if (type === 'mediaError') return 'media error — codec not supported';
	return "couldn't play this stream";
}

export function nativeErrorMessage(code: number | undefined): string {
	if (code === 4) return 'unsupported format';
	if (code === 2) return 'network error';
	return "couldn't play this stream";
}
