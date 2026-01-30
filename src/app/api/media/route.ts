/** @format */

// app/api/media/route.ts

import Media from '@/models/Media';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function GET() {
	await connectDB();

	const media = await Media.find({ approved: false }).sort({ createdAt: -1 }).lean();

	return NextResponse.json({ media });
}
