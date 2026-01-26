/** @format */
'use client';

import { useEffect, useState } from 'react';

type AboutData = {
	description: string;
	image: string;
};

export default function About() {
	const [about, setAbout] = useState<AboutData>({
		description: '',
		image: '',
	});

	const [edit, setEdit] = useState<AboutData>({
		description: '',
		image: '',
	});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const dirty = edit.description !== about.description || edit.image !== about.image;

	useEffect(() => {
		load();
	}, []);

	const load = async () => {
		setLoading(true);

		const res = await fetch('/api/about');
		const data = await res.json();

		const next = {
			description: data.about?.description ?? '',
			image: data.about?.image ?? '',
		};

		setAbout(next);
		setEdit(next);
		setLoading(false);
	};

	const save = async () => {
		if (!dirty || saving) return;

		setSaving(true);

		try {
			const res = await fetch('/api/about', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(edit),
			});

			const data = await res.json();

			const next = {
				description: data.about?.description ?? '',
				image: data.about?.image ?? '',
			};

			setAbout(next);
			setEdit(next);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className='text-white/60'>Loading about…</div>;
	}

	return (
		<div className='flex flex-col gap-6'>
			<h2 className='text-xl font-semibold'>About</h2>

			{/* Description */}
			<div className='flex flex-col gap-2'>
				<div className='text-xs text-white/50'>Description</div>

				<textarea
					value={edit.description}
					onChange={(e) =>
						setEdit((prev) => ({
							...prev,
							description: e.target.value,
						}))
					}
					rows={6}
					className='rounded-md bg-white/10 p-3 text-sm outline-none resize-none'
				/>
			</div>

			{/* Image */}
			<div className='flex flex-col gap-2'>
				<div className='text-xs text-white/50'>Image URL</div>

				<input
					value={edit.image}
					onChange={(e) =>
						setEdit((prev) => ({
							...prev,
							image: e.target.value,
						}))
					}
					placeholder='https://…'
					className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none'
				/>

				{edit.image && (
					<div className='pt-2'>
						<img src={edit.image} className='max-w-sm rounded-xl border border-white/10 object-cover' />
					</div>
				)}
			</div>

			{/* Actions */}
			{dirty && (
				<div className='flex justify-end pt-2'>
					<button onClick={save} disabled={saving} className='rounded-md bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition disabled:opacity-40'>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			)}
		</div>
	);
}
