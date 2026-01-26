/** @format */

import { NextResponse } from 'next/server';
import { Track } from '@/models/Track';
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

export async function GET(req: Request) {
	await connectDB();

	const { searchParams } = new URL(req.url);
	const albumId = searchParams.get('albumId');

	if (!albumId) {
		return NextResponse.json({ error: 'Missing albumId' }, { status: 400 });
	}

	const token = await getAccessToken();

	const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50&market=NL`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: 'no-store',
	});

	if (!res.ok) {
		return NextResponse.json({ tracks: [] }, { status: 500 });
	}

	const data = await res.json();

	// Ensure tracks exist in Mongo
	for (const t of data.items ?? []) {
		await Track.updateOne({ spotifyTrackId: t.id }, { $setOnInsert: { spotifyTrackId: t.id } }, { upsert: true });
	}

	const dbTracks = await Track.find({});

	const tracks = (data.items ?? []).map((t: any) => {
		const db = dbTracks.find((d) => d.spotifyTrackId === t.id);

		return {
			id: t.id,
			name: t.name,
			durationMs: t.duration_ms,
			trackNumber: t.track_number,
			spotifyUrl: t.external_urls?.spotify ?? '',
			videoUrl: db?.videoUrl ?? '',
		};
	});

	return NextResponse.json({ tracks });
}

export async function PATCH(req: Request) {
	await connectDB();

	const body = await req.json();
	const { spotifyTrackId, videoUrl } = body;

	if (!spotifyTrackId) {
		return NextResponse.json({ error: 'Missing spotifyTrackId' }, { status: 400 });
	}

	await Track.updateOne({ spotifyTrackId }, { $set: { videoUrl } }, { upsert: true });

	return NextResponse.json({ success: true });
}
