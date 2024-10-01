export type FeedItem = {
	id: number;
	title: string;
	author: string;
	url: string;
};

const STREAMS: Array<{ title: string; author: string; url: string }> = [
	{
		title: 'Big Buck Bunny',
		author: '@mux',
		url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
	},
	{
		title: 'Tears of Steel',
		author: '@mux',
		url: 'https://test-streams.mux.dev/tos_ismc/main.m3u8'
	},
	{
		title: 'Sintel',
		author: '@bitmovin',
		url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
	},
	{
		title: 'Art of Motion',
		author: '@bitmovin',
		url: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
	},
	{
		title: 'Playhouse VR',
		author: '@bitmovin',
		url: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/105560.m3u8'
	},
	{
		title: 'Dolby Vision Atmos',
		author: '@dolby',
		url: 'http://d3rlna7iyyu8wu.cloudfront.net/DolbyVision_Atmos/profile5_HLS/master.m3u8'
	},
	{
		title: 'Universe Fury',
		author: '@dolby',
		url: 'http://d3rlna7iyyu8wu.cloudfront.net/Atmos/HLS/universe_fury_HLS/Universe_Fury_10000000.m3u8'
	},
	{
		title: 'Elephants Dream',
		author: '@theoplayer',
		url: 'https://cdn.theoplayer.com/video/elephants-dream/playlist.m3u8'
	},
	{
		title: 'Adult Swim Clip',
		author: '@theoplayer',
		url: 'https://cdn.theoplayer.com/video/adultswim/clip.m3u8'
	}
];

export function generateFeed(): FeedItem[] {
	return STREAMS.map((s, i) => ({ id: i + 1, ...s }));
}
