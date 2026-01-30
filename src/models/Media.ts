/** @format */

// models/Media.ts

import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema(
	{
		eventId: { type: String, required: true },
		blobUrl: { type: String, required: true },
		approved: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
