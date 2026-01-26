/** @format */

import mongoose, { Model, Schema } from 'mongoose';

import bcrypt from 'bcryptjs';

export type UserDoc = mongoose.Document & {
	email: string;
	name?: string;
	password: string;
	role: 'admin' | 'editor';

	isAdmin: boolean;

	// Band profile
	isBandMember: boolean;
	displayName: string;
	bio: string;
	image: string;

	comparePassword(candidate: string): Promise<boolean>;
};

const UserSchema = new Schema<UserDoc>(
	{
		email: { type: String, required: true },
		password: { type: String, required: true },

		name: { type: String, default: '' },

		role: {
			type: String,
			enum: ['admin', 'editor'],
			default: 'editor',
		},

		isAdmin: { type: Boolean, default: false },

		// Band profile fields
		isBandMember: { type: Boolean, default: false },
		displayName: { type: String, default: '' },
		bio: { type: String, default: '' },
		image: { type: String, default: '' },
	},
	{
		timestamps: true,
	}
);

/* ----------------------------- Password hash ----------------------------- */

UserSchema.pre('save', async function () {
	const user = this as UserDoc;

	if (!user.isModified('password')) return;

	const saltRounds = 10;
	user.password = await bcrypt.hash(user.password, saltRounds);
});

/* --------------------------- Password compare --------------------------- */

UserSchema.methods.comparePassword = async function (this: UserDoc, candidate: string) {
	return bcrypt.compare(candidate, this.password);
};

/* ------------------------------- Model ---------------------------------- */

export const User: Model<UserDoc> = mongoose.models.User || mongoose.model<UserDoc>('User', UserSchema);
