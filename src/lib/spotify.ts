/** @format */

type SpotifyTokenResponse = {
	access_token: string;
	expires_in: number;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken() {
	if (cachedToken && Date.now() < cachedToken.expiresAt) {
		return cachedToken.token;
	}

	const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

	const res = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${creds}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: 'grant_type=client_credentials',
	});

	if (!res.ok) {
		throw new Error('Failed to get Spotify token');
	}

	const data = (await res.json()) as SpotifyTokenResponse;

	cachedToken = {
		token: data.access_token,
		expiresAt: Date.now() + data.expires_in * 1000 - 10_000,
	};

	return cachedToken.token;
}

export type SpotifyTrack = {
	id: string;
	name: string;
	artist: string;
	image?: string;
	url: string;
};

export async function getArtistTracks(artistId: string): Promise<SpotifyTrack[]> {
	const token = await getAccessToken();

	const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=NL`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		next: { revalidate: 60 * 60 },
	});

	if (!res.ok) {
		throw new Error('Failed to fetch artist tracks');
	}

	const data = await res.json();

	return (data.tracks ?? []).map((t: any) => ({
		id: t.id,
		name: t.name,
		artist: t.artists.map((a: any) => a.name).join(', '),
		image: t.album.images?.[0]?.url,
		url: t.external_urls.spotify, // <-- important
	}));
}
