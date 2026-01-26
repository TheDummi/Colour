/** @format */

import { Schema, model, models } from 'mongoose';

const AboutSchema = new Schema({
	description: { type: String, default: '' },
	image: { type: String, default: '' },
});

export const About = models.About || model('About', AboutSchema);
