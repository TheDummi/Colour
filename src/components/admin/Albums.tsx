/** @format */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Albums() {
	const [albums, setAlbums] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const [expanded, setExpanded] = useState<string | null>(null);
	const [tracks, setTracks] = useState<Record<string, any[]>>({});

	const [savingAlbumId, setSavingAlbumId] = useState<string | null>(null);
	const [savingTrackId, setSavingTrackId] = useState<string | null>(null);

	const loadAlbums = async () => {
		setLoading(true);
		const res = await fetch('/api/albums');
		const data = await res.json();

		const hydrated = (data.albums ?? []).map((a: any) => ({
			...a,
			_albumEdit: {
				description: a.description ?? '',
			},
			_albumDirty: false,
		}));

		setAlbums(hydrated);
		setLoading(false);
	};

	useEffect(() => {
		loadAlbums();
	}, []);

	const loadTracks = async (albumId: string) => {
		const res = await fetch(`/api/tracks?albumId=${albumId}`);
		const data = await res.json();

		const hydrated = (data.tracks ?? []).map((t: any) => ({
			...t,
			_edit: {
				videoUrl: t.videoUrl ?? '',
			},
			_dirty: false,
		}));

		setTracks((prev) => ({
			...prev,
			[albumId]: hydrated,
		}));
	};

	const toggleAlbum = async (albumId: string) => {
		if (expanded === albumId) {
			setExpanded(null);
			return;
		}

		setExpanded(albumId);
		await loadTracks(albumId);
	};

	// --------------------
	// Album editing
	// --------------------

	const updateAlbumDescription = (albumId: string, value: string) => {
		setAlbums((prev) =>
			prev.map((a) => {
				if (a.id !== albumId) return a;

				const next = {
					...a,
					_albumEdit: { description: value },
				};

				next._albumDirty = next._albumEdit.description !== a.description;

				return next;
			})
		);
	};

	const saveAlbum = async (album: any) => {
		if (savingAlbumId || !album._albumDirty) return;

		setSavingAlbumId(album.id);

		try {
			await fetch('/api/albums', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					spotifyId: album.id,
					description: album._albumEdit.description,
				}),
			});

			setAlbums((prev) =>
				prev.map((a) =>
					a.id === album.id
						? {
								...a,
								description: album._albumEdit.description,
								_albumDirty: false,
							}
						: a
				)
			);
		} finally {
			setSavingAlbumId(null);
		}
	};

	// --------------------
	// Track editing
	// --------------------

	const updateTrack = (albumId: string, trackId: string, value: string) => {
		setTracks((prev) => ({
			...prev,
			[albumId]: prev[albumId].map((t) => {
				if (t.id !== trackId) return t;

				const next = {
					...t,
					_edit: { videoUrl: value },
				};

				next._dirty = next._edit.videoUrl !== t.videoUrl;

				return next;
			}),
		}));
	};

	const saveTrack = async (albumId: string, track: any) => {
		if (savingTrackId || !track._dirty) return;

		setSavingTrackId(track.id);

		try {
			await fetch('/api/tracks', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					spotifyTrackId: track.id,
					videoUrl: track._edit.videoUrl,
				}),
			});

			setTracks((prev) => ({
				...prev,
				[albumId]: prev[albumId].map((t) =>
					t.id === track.id
						? {
								...t,
								videoUrl: track._edit.videoUrl,
								_dirty: false,
							}
						: t
				),
			}));
		} finally {
			setSavingTrackId(null);
		}
	};

	if (loading) {
		return <div className='text-white/60'>Loading albums…</div>;
	}

	return (
		<div className='flex flex-col gap-6'>
			<h2 className='text-xl font-semibold'>Albums</h2>

			<div className='flex flex-col gap-4'>
				{albums.map((album) => {
					const isOpen = expanded === album.id;
					const albumTracks = tracks[album.id];

					return (
						<div key={album.id} className='rounded-xl border border-white/10 bg-white/5'>
							{/* Album header */}
							<button onClick={() => toggleAlbum(album.id)} className='flex w-full items-center gap-4 p-4 text-left hover:bg-white/5 transition'>
								<img src={album.image} className='w-16 h-16 rounded-md object-cover shrink-0' />

								<div className='flex flex-col'>
									<div className='font-medium'>{album.name}</div>
									<div className='text-xs text-white/50'>{album.releaseDate}</div>
								</div>
							</button>

							{/* Album body */}
							<AnimatePresence initial={false}>
								{isOpen && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.2 }}
										className='overflow-hidden border-t border-white/10 p-4 flex flex-col gap-4'>
										<div className='border-t border-white/10 p-4 flex flex-col gap-4'>
											{/* Album description */}
											<div className='flex flex-col gap-2'>
												<div className='text-xs text-white/50'>Album description</div>

												<textarea
													value={album._albumEdit.description}
													onChange={(e) => updateAlbumDescription(album.id, e.target.value)}
													rows={3}
													className='rounded-md bg-white/10 p-3 text-sm outline-none resize-none'
												/>

												{album._albumDirty && (
													<div className='flex justify-end'>
														<button
															disabled={savingAlbumId === album.id}
															onClick={() => saveAlbum(album)}
															className='rounded-md bg-white/10 hover:bg-white/20 px-3 py-2 text-xs transition disabled:opacity-40'>
															{savingAlbumId === album.id ? 'Saving…' : 'Save description'}
														</button>
													</div>
												)}
											</div>

											{/* Tracks */}
											<div className='flex flex-col gap-3'>
												{!albumTracks && <div className='text-white/40 text-sm'>Loading tracks…</div>}

												{Array.isArray(albumTracks) && albumTracks.length === 0 && <div className='text-white/40 text-sm'>No tracks found.</div>}

												{Array.isArray(albumTracks) &&
													albumTracks.map((track) => (
														<div key={track.id} className='flex items-center gap-3'>
															<div className='w-6 text-xs text-white/40'>{track.trackNumber}</div>

															<div className='flex-1 text-sm'>{track.name}</div>

															<input
																value={track._edit.videoUrl}
																onChange={(e) => updateTrack(album.id, track.id, e.target.value)}
																placeholder='Video URL…'
																className='flex-1 rounded-md bg-white/10 px-3 py-2 text-xs outline-none'
															/>

															{track._dirty && (
																<button
																	disabled={savingTrackId === track.id}
																	onClick={() => saveTrack(album.id, track)}
																	className='rounded-md bg-white/10 hover:bg-white/20 px-3 py-2 text-xs transition disabled:opacity-40'>
																	{savingTrackId === track.id ? 'Saving…' : 'Save'}
																</button>
															)}
														</div>
													))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					);
				})}
			</div>
		</div>
	);
}
