/** @format */

// app/events/[id]/page.tsx

import { Event } from '@/models/Event';
import EventGallery from '@/components/EventGallery';
import Media from '@/models/Media';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function EventPage({ params }: PageProps) {
	const { id } = await params;

	if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

	await connectDB();
	const event = await Event.findById(id).lean();
	if (!event) return notFound();

	const hasPassed = new Date(event.date).getTime() < new Date().getTime();

	return (
		<div className='max-w-3xl mx-auto flex flex-col gap-6'>
			<h1 className='text-3xl font-semibold'>{event.title}</h1>

			<div className='text-sm text-white/60'>
				{new Date(event.date).toLocaleString()}
				{event.location && ` · ${event.location}`}
			</div>

			{event.image && <img src={event.image} alt={event.title} className='rounded-xl border border-white/10 object-cover' />}

			{event.description && <div className='prose prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: event.description }} />}

			{hasPassed && <EventGallery eventId={event._id.toString()} />}
			{/* Client-side gallery + upload */}
		</div>
	);
}

export async function POST(req: Request, { params }: PageProps) {
	await connectDB();

	const { id } = await params;
	const { action } = await req.json();

	if (!id || !action) {
		return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
	}

	if (action === 'approve') {
		await Media.findByIdAndUpdate(id, { approved: true });
	}

	if (action === 'reject') {
		await Media.findByIdAndDelete(id);
	}

	return NextResponse.json({ success: true });
}
