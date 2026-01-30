/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type MediaItem = {
	_id: string;
	blobUrl: string;
	eventId: string;
	eventTitle?: string;
};

export default function Media() {
	const [media, setMedia] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const loadMedia = async () => {
		setLoading(true);
		const res = await fetch('/api/media');
		const data = await res.json();

		const { events } = await fetch(`/api/events`).then((res) => res.json());

		for (const item of data.media ?? []) {
			item.eventTitle = events?.find((e: Record<string, string>) => e._id === item.eventId)?.title;
		}

		setMedia(data.media ?? []);
		setLoading(false);
	};

	useEffect(() => {
		(async () => {
			await loadMedia();
		})();
	}, []);

	// keyboard navigation
	useEffect(() => {
		if (activeIndex === null) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setActiveIndex(null);
			if (e.key === 'ArrowRight') setActiveIndex((i) => (i! + 1) % media.length);
			if (e.key === 'ArrowLeft') setActiveIndex((i) => (i! - 1 + media.length) % media.length);
		};

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [activeIndex, media.length]);

	const updateStatus = async (id: string, action: 'approve' | 'reject') => {
		await fetch(`/api/media/${id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action }),
		});

		setMedia((prev) => {
			const index = prev.findIndex((i) => i._id === id);
			if (index === -1) return prev;

			const next = prev.filter((i) => i._id !== id);

			// decide next active index
			if (next.length === 0) {
				setActiveIndex(null);
			} else if (index < next.length) {
				setActiveIndex(index);
			} else {
				setActiveIndex(next.length - 1);
			}

			return next;
		});
	};

	return (
		<div className='relative flex flex-col gap-6'>
			<h2 className='text-xl font-semibold'>Media submissions</h2>

			{loading && <p className='text-white/60'>Loading submissions…</p>}

			{!loading && media.length === 0 && <p className='text-white/40 text-sm'>No pending images. Everyone behaved. Unsettling.</p>}

			<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{media.map((m, i) => (
					<button key={m._id} onClick={() => setActiveIndex(i)} className='relative bg-white/5 rounded-lg overflow-hidden group'>
						<img src={m.blobUrl} className='aspect-square object-cover transition group-hover:scale-105' loading='lazy' />
					</button>
				))}
			</div>

			{/* Fullscreen viewer */}
			<AnimatePresence>
				{activeIndex !== null && media[activeIndex] && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='absolute inset-0 z-50 bg-black/95'>
						{/* Main content */}

						<div className='absolute inset-0 flex items-start justify-between px-6 gap-6'>
							<button onClick={() => setActiveIndex((i) => (i! - 1 + media.length) % media.length)} className='translate-y-100 text-white/60 hover:text-white'>
								<ChevronLeft size={36} />
							</button>
							{/* Image */}
							<div className='-translate-y-20 flex flex-col items-center max-w-full'>
								<motion.img
									key={media[activeIndex]._id}
									src={media[activeIndex].blobUrl}
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.95, opacity: 0 }}
									transition={{ type: 'spring', stiffness: 200, damping: 25 }}
									className='max-h-[75vh] max-w-[90vw] object-contain'
								/>

								{/* Actions BELOW image */}

								<h2 className='flex justify-center p-3'>{media[activeIndex].eventTitle || media[activeIndex].eventId}</h2>
								<div className='flex gap-4'>
									<button onClick={() => updateStatus(media[activeIndex]._id, 'approve')} className='flex items-center gap-2 px-4 py-2 bg-green-500/30 rounded hover:bg-green-500/50'>
										<Check size={18} />
										Approve
									</button>
									<button onClick={() => updateStatus(media[activeIndex]._id, 'reject')} className='flex items-center gap-2 px-4 py-2 bg-red-500/30 rounded hover:bg-red-500/50'>
										<Trash2 size={18} />
										Delete
									</button>
								</div>
							</div>

							{/* Prev / Next */}

							<button onClick={() => setActiveIndex((i) => (i! + 1) % media.length)} className='translate-y-100 text-white/60 hover:text-white'>
								<ChevronRight size={36} />
							</button>
						</div>
						{/* Close */}
						<button onClick={() => setActiveIndex(null)} className='absolute top-6 right-6 text-white/70 hover:text-white'>
							<X size={28} />
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
