/** @format */

import mongoose, { Model, Schema } from 'mongoose';

export type EventDoc = mongoose.Document & {
	title: string;
	description: string;
	location: string;
	date: string;
	link: string;
	image: string;
};

const EventSchema = new Schema<EventDoc>(
	{
		title: { type: String, required: true },
		description: { type: String, default: '' },
		location: { type: String, default: '' },
		date: { type: String, required: true }, // ISO string
		link: { type: String, default: '' },
		image: { type: String, default: '' },
	},
	{
		timestamps: true,
	}
);

export const Event: Model<EventDoc> = mongoose.models.Event || mongoose.model<EventDoc>('Event', EventSchema);
