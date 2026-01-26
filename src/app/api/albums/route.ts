/** @format */

import { Album } from '@/models/Album';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

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

export async function GET() {
	await connectDB();

	const token = await getAccessToken();
	const ARTIST_ID = '199B2dCRTpPAPqdoD5mKrk';

	const res = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&market=NL&limit=20`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		next: { revalidate: 60 * 60 },
	});

	if (!res.ok) {
		return NextResponse.json({ albums: [] }, { status: 500 });
	}

	const data = await res.json();

	for (const a of data.items) {
		await Album.updateOne({ spotifyId: a.id }, { $setOnInsert: { spotifyId: a.id } }, { upsert: true });
	}

	const dbAlbums = await Album.find({});

	const albums = data.items.map((a: any) => {
		const db = dbAlbums.find((d) => d.spotifyId === a.id);

		return {
			id: a.id,
			name: a.name,
			image: a.images?.[0]?.url,
			releaseDate: a.release_date,
			url: a.external_urls.spotify,
			description: db?.description ?? '',
			featured: db?.featured ?? false,
			order: db?.order ?? 0,
		};
	});

	return NextResponse.json({ albums });
}

export async function PATCH(req: Request) {
	await connectDB();

	const body = await req.json();
	const { spotifyId, description, featured, order } = body;

	if (!spotifyId) {
		return NextResponse.json({ error: 'Missing spotifyId' }, { status: 400 });
	}

	await Album.updateOne(
		{ spotifyId },
		{
			$set: {
				description,
				featured,
				order,
			},
		},
		{ upsert: true }
	);

	return NextResponse.json({ success: true });
}
