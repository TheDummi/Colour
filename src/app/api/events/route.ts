/** @format */

import { Event } from '@/models/Event';
import Media from '@/models/Media';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function GET() {
	await connectDB();

	const events = await Event.find()
		.sort({
			date: -1,
		})
		.lean();

	for (const event of events) {
		const media = await Media.find({ eventId: event._id, approved: true });
		event.media = media || [];
	}

	return NextResponse.json({ events });
}

export async function POST(req: Request) {
	await connectDB();

	const body = await req.json();
	const { title, description, location, date, link, image } = body;

	if (!title || !date) {
		return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
	}

	const event = await Event.create({
		title,
		description: String(description || ''),
		location: String(location || ''),
		date,
		link: String(link || ''),
		image: String(image || ''),
	});

	return NextResponse.json({ event });
}

export async function PATCH(req: Request) {
	await connectDB();

	const body = await req.json();
	const { id, title, description, location, date, link, image } = body;

	if (!id) {
		return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
	}

	const update: Record<string, string> = {};

	if (typeof title === 'string') update.title = title;
	if (typeof description === 'string') update.description = description;
	if (typeof location === 'string') update.location = location;
	if (typeof date === 'string') update.date = date;
	if (typeof link === 'string') update.link = link;
	if (typeof image === 'string') update.image = image;

	const updated = await Event.findByIdAndUpdate(id, { $set: update }, { new: true });

	if (!updated) {
		return NextResponse.json({ error: 'Event not found' }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
	await connectDB();

	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	await Event.findByIdAndDelete(id);

	return NextResponse.json({ success: true });
}
