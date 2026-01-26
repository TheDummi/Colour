/** @format */

import { Schema, model, models } from 'mongoose';

const AlbumSchema = new Schema(
	{
		spotifyId: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
			default: '',
		},
		featured: {
			type: Boolean,
			default: false,
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const Album = models.Album || model('Album', AlbumSchema);
