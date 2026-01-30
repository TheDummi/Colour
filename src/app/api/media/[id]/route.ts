/** @format */

import Media from '@/models/Media';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
	await connectDB();
	const { id } = await params;

	const images = await Media.find({
		eventId: id,
		approved: true,
	}).sort({ createdAt: -1 });

	return NextResponse.json({ images });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	await connectDB();

	const { id } = await params;
	if (!id) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });

	await Media.findByIdAndDelete(id);

	return NextResponse.json({ success: true });
}
