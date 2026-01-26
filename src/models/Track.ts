/** @format */

import { Schema, model, models } from 'mongoose';

const TrackSchema = new Schema(
	{
		spotifyTrackId: {
			type: String,
			required: true,
			unique: true,
		},
		videoUrl: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

export const Track = models.Track || model('Track', TrackSchema);
