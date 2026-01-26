/** @format */

import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongoose';

function parseBoolean(value: boolean): boolean {
	if (value === true) return true;
	if (value === false) return false;
	if (value === 'true') return true;
	if (value === 'false') return false;
	return false;
}

export async function GET() {
	await connectDB();

	const users = await User.find(
		{},
		{
			password: 0,
		}
	).sort({
		createdAt: -1,
	});

	return NextResponse.json({ users });
}

export async function POST(req: Request) {
	await connectDB();

	const body = await req.json();
	const {
		email,
		name,
		password,
		role,

		// band fields
		isBandMember,
		displayName,
		bio,
		image,
	} = body;

	if (!email || !password) {
		return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
	}

	const existing = await User.findOne({ email });
	if (existing) {
		return NextResponse.json({ error: 'User already exists' }, { status: 400 });
	}

	const user = await User.create({
		email,
		name,
		password,
		role: role || 'editor',

		// band fields
		isBandMember: parseBoolean(isBandMember),
		displayName: String(displayName || ''),
		bio: String(bio || ''),
		image: String(image || ''),
	});

	return NextResponse.json({
		id: user._id,
		email: user.email,
		name: user.name,
		role: user.role,

		isBandMember: user.isBandMember,
		displayName: user.displayName,
		bio: user.bio,
		image: user.image,
	});
}

export async function PATCH(req: Request) {
	await connectDB();

	const body = await req.json();
	const {
		id,
		name,
		role,
		password,

		// band fields
		isBandMember,
		displayName,
		bio,
		image,
	} = body;

	if (!id) {
		return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
	}

	const update: Record<string, string | boolean> = {};

	// Basic fields
	if (typeof name === 'string') update.name = name;

	if (role === 'admin' || role === 'editor') {
		update.role = role;
	}

	// Band fields
	if (isBandMember !== undefined) {
		update.isBandMember = isBandMember === true || isBandMember === 'true';
	}

	if (typeof displayName === 'string') {
		update.displayName = displayName.trim();
	}

	if (typeof bio === 'string') {
		update.bio = bio;
	}

	if (typeof image === 'string') {
		update.image = image;
	}

	// Password update (hashing still happens via schema hook)
	if (typeof password === 'string' && password.length > 0) {
		update.password = password;
	}

	const updated = await User.findByIdAndUpdate(
		id,
		{ $set: update },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!updated) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 });
	}

	return NextResponse.json({
		success: true,
	});
}

export async function DELETE(req: Request) {
	await connectDB();

	const { searchParams } = new URL(req.url);
	const id = searchParams.get('id');

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	await User.findByIdAndDelete(id);

	return NextResponse.json({ success: true });
}
