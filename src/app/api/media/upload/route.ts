/** @format */

// app/api/event-images/upload/route.ts

import Media from '@/models/Media';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
	await connectDB();

	const form = await req.formData();
	const file = form.get('file') as File;
	const eventId = form.get('eventId') as string;

	if (!file || !eventId) {
		return NextResponse.json({ error: 'Missing data' }, { status: 400 });
	}

	const blob = await put(`events/${eventId}/${crypto.randomUUID()}-${file.name}`, file, { access: 'public' });

	await Media.create({
		eventId,
		blobUrl: blob.url,
	});

	return NextResponse.json({ url: blob.url });
}
