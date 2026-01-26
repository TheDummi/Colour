/** @format */

import { About } from '@/models/About';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function GET() {
	await connectDB();

	let about = await About.findOne();
	if (!about) {
		about = await About.create({});
	}

	return NextResponse.json({ about });
}

export async function PATCH(req: Request) {
	await connectDB();
	const body = await req.json();

	let about = await About.findOne();
	if (!about) {
		about = await About.create({});
	}

	about.description = body.description ?? about.description;
	about.image = body.image ?? about.image;

	await about.save();

	return NextResponse.json({ about });
}
