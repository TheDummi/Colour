/** @format */
'use client';

import { Camera, Download, Edit, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

type Event = {
	_id: string;
	title: string;
	description: string;
	location: string;
	date: string;
	link: string;
	image: string;
	media?: MediaItem[];
};

type PlaceResult = {
	display_name: string;
};

type MediaItem = {
	_id: string;
	blobUrl: string;
};

export default function Events() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	const [editing, setEditing] = useState<Event | null>(null);

	const [locationQuery, setLocationQuery] = useState('');
	const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
	const [loadingPlaces, setLoadingPlaces] = useState(false);

	const [openGallery, setOpenGallery] = useState<string | null>(null);

	const empty: Event = {
		_id: '',
		title: '',
		description: '',
		location: '',
		date: '',
		link: '',
		image: '',
		media: [],
	};

	useEffect(() => {
		load();
	}, []);

	const load = async () => {
		const res = await fetch('/api/events');
		const data = await res.json();

		setEvents(data.events ?? []);
		setLoading(false);
	};

	const save = async () => {
		if (!editing) return;

		const payload = {
			...editing,
			id: editing._id || undefined,
		};

		delete editing.media;

		await fetch('/api/events', {
			method: editing._id ? 'PATCH' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		setEditing(null);
		load();
	};

	const closeSuggestions = () => {
		setSuggestions([]);
	};

	const remove = async (id: string) => {
		await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
		load();
	};

	useEffect(() => {
		if (!locationQuery || locationQuery?.length < 3) {
			setSuggestions([]);
			return;
		}

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			try {
				setLoadingPlaces(true);

				const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5`, { signal: controller.signal });

				const data = await res.json();
				setSuggestions(data ?? []);
			} catch {
				// ignore aborted requests
			} finally {
				setLoadingPlaces(false);
			}
		}, 300); // debounce typing

		return () => {
			controller.abort();
			clearTimeout(timeout);
		};
	}, [locationQuery]);

	if (loading) return <div>Loading events…</div>;

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>Events</h2>

				<button onClick={() => setEditing({ ...empty })} className='rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm'>
					Add event
				</button>
			</div>

			{/* Editor */}
			{editing && (
				<div className='rounded-xl border border-white/10 bg-black/70 p-4 flex flex-col gap-3'>
					<input
						onFocus={closeSuggestions}
						placeholder='Title'
						value={editing.title}
						onChange={(e) =>
							setEditing({
								...editing,
								title: e.target.value,
							})
						}
						className='bg-white/10 px-3 py-2 rounded'
					/>

					<input
						onFocus={closeSuggestions}
						type='datetime-local'
						value={editing.date ? editing.date.slice(0, 16) : ''}
						onChange={(e) =>
							setEditing({
								...editing,
								date: new Date(e.target.value).toISOString(),
							})
						}
						className='bg-white/10 px-3 py-2 rounded'
					/>

					<div className='relative'>
						<input
							type='text'
							placeholder='Venue, City'
							value={locationQuery}
							onChange={(e) => {
								setLocationQuery(e.target.value);
								setEditing({
									...editing,
									location: e.target.value,
								});
							}}
							className='w-full bg-white/10 px-3 py-2 rounded outline-none'
						/>

						{/* Suggestions dropdown */}
						{suggestions?.length > 0 && (
							<div className='absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-black/90 backdrop-blur shadow-lg overflow-hidden'>
								{suggestions.map((place, i) => (
									<button
										key={i}
										onClick={() => {
											setLocationQuery(place.display_name);
											setEditing({
												...editing,
												location: place.display_name,
											});
											setSuggestions([]);
										}}
										className='block w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition'>
										{place.display_name}
									</button>
								))}
							</div>
						)}

						{loadingPlaces && <div className='absolute right-3 top-2 text-xs text-white/40'>searching…</div>}
					</div>

					<input
						onFocus={closeSuggestions}
						placeholder='Image URL'
						value={editing.image}
						onChange={(e) =>
							setEditing({
								...editing,
								image: e.target.value,
							})
						}
						className='bg-white/10 px-3 py-2 rounded'
					/>

					<input
						onFocus={closeSuggestions}
						placeholder='Link'
						value={editing.link}
						onChange={(e) =>
							setEditing({
								...editing,
								link: e.target.value,
							})
						}
						className='bg-white/10 px-3 py-2 rounded'
					/>

					<textarea
						onFocus={closeSuggestions}
						placeholder='Description (HTML allowed)'
						value={editing.description}
						onChange={(e) =>
							setEditing({
								...editing,
								description: e.target.value,
							})
						}
						rows={4}
						className='bg-white/10 px-3 py-2 rounded resize-none'
					/>

					<div className='flex justify-end gap-3'>
						<button onClick={() => setEditing(null)} className='text-white/60'>
							Cancel
						</button>

						<button onClick={save} className='rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2'>
							Save
						</button>
					</div>
				</div>
			)}

			<div className='flex flex-col gap-3'>
				{events.map((e) => (
					<div key={e._id} className='flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm'>
						<div className='w-full'>
							<div className='flex justify-between p-2'>
								<div>
									<div className='font-medium'>{e.title}</div>
									<div className='text-xs text-white/50'>{new Date(e.date).toLocaleDateString()}</div>
								</div>

								<div className='flex gap-3'>
									<button
										onClick={() => {
											setEditing(e);
											setLocationQuery(e.location || '');
										}}
										className='text-xs hover:text-white'>
										<Edit size={14} />
									</button>

									<button
										onClick={() => {
											if (!e.media || e.media.length === 0) return;
											setOpenGallery(openGallery === e._id ? null : e._id);
										}}
										disabled={!e.media || e.media.length === 0}
										className={`text-xs transition ${!e.media || e.media.length === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}>
										<Camera size={14} />
									</button>

									<button onClick={() => remove(e._id)} className='text-xs text-red-400 hover:text-red-300'>
										<Trash size={14} />
									</button>
								</div>
							</div>
							{openGallery === e._id && (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
									{e.media?.length === 0 && <div className='text-xs text-white/40 col-span-full'>No images for this event.</div>}

									{e.media?.map((img) => (
										<div key={img._id} className='flex items-center gap-3 rounded bg-white/5 p-2'>
											{/* Thumbnail */}
											<img src={img.blobUrl} className='h-12 w-12 rounded object-cover shrink-0' />

											{/* Title / identifier */}
											<div className='flex-1 min-w-0'>
												<span className='block text-xs text-white/60 truncate'>{img._id}</span>
											</div>

											{/* Actions */}
											<div className='flex gap-2'>
												<button
													className='text-white/60 hover:text-white hover:cursor-pointer'
													title='Download image'
													onClick={async () => {
														const res = await fetch(img.blobUrl);
														if (!res.ok) throw new Error('Download failed');
														const blob = await res.blob();
														const url = URL.createObjectURL(blob);

														const a = document.createElement('a');
														a.href = url;
														a.download = `image-${img._id}`;
														document.body.appendChild(a);
														a.click();
														a.remove();

														URL.revokeObjectURL(url);
													}}>
													<Download size={14} />
												</button>

												<button
													onClick={async () => {
														await fetch(`/api/media/${img._id}`, {
															method: 'DELETE',
														});
														load();
													}}
													className='text-red-400 hover:text-red-300'
													title='Delete image'>
													<Trash size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
