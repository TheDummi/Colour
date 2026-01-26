/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Music, X, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

type Album = {
	id: string;
	name: string;
	image: string;
	description: string;
	url: string;
};

type Track = {
	id: string;
	name: string;
	trackNumber: number;
	spotifyUrl: string;
	videoUrl: string;
};

export default function MusicPage() {
	const [albums, setAlbums] = useState<Album[]>([]);
	const [tracks, setTracks] = useState<Record<string, Track[]>>({});
	const [loading, setLoading] = useState(true);
	const [activeVideo, setActiveVideo] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		init();
	}, []);

	const init = async () => {
		const res = await fetch('/api/albums');
		const data = await res.json();
		const albumsData = data.albums ?? [];

		setAlbums(albumsData);

		const results = await Promise.all(
			albumsData.map(async (album: Album) => {
				const res = await fetch(`/api/tracks?albumId=${album.id}`);
				const data = await res.json();
				return {
					albumId: album.id,
					tracks: data.tracks ?? [],
				};
			})
		);

		const merged: Record<string, Track[]> = {};
		for (const r of results) {
			merged[r.albumId] = r.tracks;
		}

		setTracks(merged);
		setLoading(false);
	};

	const getYoutubeEmbed = (url: string) => {
		try {
			const u = new URL(url);
			if (u.hostname.includes('youtu.be')) {
				return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
			}
			if (u.searchParams.get('v')) {
				return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
			}
			return url;
		} catch {
			return url;
		}
	};

	if (loading) {
		return <div className='text-white/60'>Loading music…</div>;
	}

	return (
		<>
			{/* Portal video modal */}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{activeVideo && (
							<>
								{/* Backdrop */}
								<motion.div className='fixed inset-0 bg-black/70 backdrop-blur-sm' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveVideo(null)} />

								{/* Centering wrapper (NO animation here) */}
								<div className='fixed left-1/2 top-1/2 z-50 w-full max-w-4xl px-4' style={{ transform: 'translate(-50%, -50%)' }} onClick={() => setActiveVideo(null)}>
									{/* Animated modal */}
									<motion.div
										initial={{ scale: 0.9, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.9, opacity: 0 }}
										className='relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl'
										onClick={(e) => e.stopPropagation()}>
										<button onClick={() => setActiveVideo(null)} className='absolute top-3 right-3 z-10 rounded-md bg-black/60 hover:bg-black/80 p-2'>
											<X size={18} />
										</button>

										<iframe src={getYoutubeEmbed(activeVideo)} className='w-full h-full' allow='autoplay; encrypted-media; fullscreen; picture-in-picture' />
									</motion.div>
								</div>
							</>
						)}
					</AnimatePresence>,
					document.body
				)}

			{/* Page */}
			<div className='flex flex-col gap-24'>
				{albums.map((album, index) => {
					const albumTracks = tracks[album.id] ?? [];
					const reversed = index % 2 === 1;

					return (
						<div key={album.id} className={`flex flex-col md:flex-row gap-10 items-start ${reversed ? 'md:flex-row-reverse' : ''}`}>
							{/* Cover */}
							<div className='relative group'>
								<div className='absolute -inset-2 rounded-xl bg-purple-500/20 blur-xl opacity-40 group-hover:opacity-70 transition' />

								<img src={album.image} className='relative w-64 rounded-xl object-cover shrink-0' />
							</div>

							{/* Info */}
							<div className='flex flex-col gap-4 flex-1'>
								<div className='flex items-center gap-3'>
									<h2 className='text-2xl font-semibold'>{album.name}</h2>

									<a href={album.url} target='_blank' title='Open album on Spotify' className='inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 p-2 transition'>
										<Music size={18} />
									</a>
								</div>

								{album.description && <p className='text-white/80 leading-relaxed max-w-2xl'>{album.description}</p>}

								{/* Tracks */}
								<div className='flex flex-col gap-2 pt-3'>
									{albumTracks.map((track) => (
										<motion.div
											key={track.id}
											whileHover={{
												x: 4,
												scale: 1.01,
											}}
											transition={{
												type: 'spring',
												stiffness: 300,
												damping: 20,
											}}
											className='group flex items-center gap-3 text-sm rounded-md px-2 py-1 hover:bg-white/5'>
											<div className='w-6 text-white/40'>{track.trackNumber}</div>

											<div className='flex-1'>{track.name}</div>

											{track.spotifyUrl && (
												<a href={track.spotifyUrl} target='_blank' title='Open on Spotify' className='inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 p-2 transition'>
													<Music size={14} />
												</a>
											)}

											{track.videoUrl && (
												<button
													onClick={() => setActiveVideo(track.videoUrl)}
													title='Watch video'
													className='inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 p-2 transition'>
													<Youtube size={14} />
												</button>
											)}
										</motion.div>
									))}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}
