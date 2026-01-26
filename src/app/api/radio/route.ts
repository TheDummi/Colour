/** @format */

import { getArtistTracks } from '@/lib/spotify';

const ARTIST_ID = '199B2dCRTpPAPqdoD5mKrk';

export async function GET() {
	try {
		const tracks = await getArtistTracks(ARTIST_ID);
		return Response.json({ tracks });
	} catch (err) {
		console.error('Radio API error:', err);
		return Response.json({ tracks: [] }, { status: 500 });
	}
}
