/** @format */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Image = {
	_id: string;
	blobUrl: string;
};

type QueuedFile = {
	id: string;
	file: File;
	progress: number;
	error?: string;
};

const MAX_SIZE_MB = 15;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EventGallery({ eventId }: { eventId: string }) {
	const [images, setImages] = useState<Image[]>([]);
	const [queue, setQueue] = useState<QueuedFile[]>([]);
	const [uploading, setUploading] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const loadImages = async () => {
		const res = await fetch(`/api/media/${eventId}`);
		const data = await res.json();
		setImages(data.images ?? []);
	};

	useEffect(() => {
		(async () => {
			await loadImages();
		})();
	}, [eventId]);

	useEffect(() => {
		if (activeIndex === null) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setActiveIndex(null);
			if (e.key === 'ArrowRight') setActiveIndex((i) => (i! + 1) % images.length);
			if (e.key === 'ArrowLeft') setActiveIndex((i) => (i! - 1 + images.length) % images.length);
		};

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [activeIndex, images.length]);

	const validateFile = (file: File): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return 'Unsupported file type';
		}
		if (file.size > MAX_SIZE_MB * 1024 * 1024) {
			return 'File exceeds 15MB';
		}
		return null;
	};

	const onFilesSelected = (files: FileList | null) => {
		if (!files) return;

		const next: QueuedFile[] = [];

		Array.from(files).forEach((file) => {
			const error = validateFile(file);

			next.push({
				id: crypto.randomUUID(),
				file,
				progress: 0,
				error: error ?? undefined,
			});
		});

		setQueue((q) => [...q, ...next]);
	};

	const removeFromQueue = (id: string) => {
		setQueue((q) => q.filter((f) => f.id !== id));
	};

	const uploadAll = async () => {
		setUploading(true);

		for (const item of queue) {
			if (item.error) continue;

			const fd = new FormData();
			fd.append('file', item.file);
			fd.append('eventId', eventId);

			await new Promise<void>((resolve) => {
				const xhr = new XMLHttpRequest();

				xhr.upload.onprogress = (e) => {
					if (!e.lengthComputable) return;
					const percent = Math.round((e.loaded / e.total) * 100);
					setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, progress: percent } : f)));
				};

				xhr.onload = () => resolve();
				xhr.onerror = () => {
					setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, error: 'Upload failed' } : f)));
					resolve();
				};

				xhr.open('POST', '/api/media/upload');
				xhr.send(fd);
			});
		}

		setToast('Images submitted successfully');
		setQueue([]);
		await loadImages();
		setUploading(false);

		setTimeout(() => setToast(null), 3000);
	};

	return (
		<div className='flex flex-col gap-6 pt-8'>
			{toast && <div className='fixed bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded-lg'>{toast}</div>}

			{images.length > 0 && (
				<div className='flex flex-col gap-3'>
					<h2 className='text-xl font-semibold tracking-tight'>Event Gallery</h2>
					<p className='text-sm text-white/50'>Photos shared by attendees</p>

					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						{images.map((img, i) => (
							<button key={img._id} onClick={() => setActiveIndex(i)} className='relative rounded-lg overflow-hidden group'>
								<img src={img.blobUrl} className='object-cover aspect-square transition group-hover:scale-105' loading='lazy' />
							</button>
						))}
					</div>
				</div>
			)}

			<div className='flex flex-col gap-3'>
				<h3 className='text-lg font-medium'>Present? Share your images with us</h3>
				<p className='text-sm text-white/50'>Your photos will be reviewed before appearing in the gallery.</p>

				{/* upload UI */}

				<label className='flex items-center justify-center border border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:bg-white/5 transition'>
					<span className='text-sm opacity-80'>Select images (max 15MB each)</span>
					<input type='file' accept='image/*' multiple className='hidden' onChange={(e) => onFilesSelected(e.target.files)} />
				</label>

				{queue.length > 0 && (
					<div className='flex flex-col gap-2'>
						{queue.map((q) => (
							<div key={q.id} className='flex items-center gap-3 bg-white/5 p-2 rounded'>
								<span className='text-sm flex-1 truncate'>{q.file.name}</span>

								{q.error ? (
									<span className='text-xs text-red-400'>{q.error}</span>
								) : (
									<div className='w-24 h-2 bg-white/10 rounded overflow-hidden'>
										<div className='h-full bg-green-400 transition-all' style={{ width: `${q.progress}%` }} />
									</div>
								)}

								<button type='button' onClick={() => removeFromQueue(q.id)} className='text-white/60 hover:text-white' disabled={uploading}>
									✕
								</button>
							</div>
						))}
					</div>
				)}

				<button onClick={uploadAll} disabled={uploading || queue.every((q) => q.error)} className='self-start px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40'>
					{uploading ? 'Uploading…' : 'Upload images'}
				</button>
			</div>

			<AnimatePresence>
				{activeIndex !== null && images[activeIndex] && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='absolute inset-0 z-40 bg-black/95'>
						{/* Centered image */}
						<div className='absolute inset-0 flex items-center justify-center'>
							<motion.img
								key={images[activeIndex]._id}
								src={images[activeIndex].blobUrl}
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.95, opacity: 0 }}
								transition={{ type: 'spring', stiffness: 220, damping: 28 }}
								className='max-h-[85vh] max-w-[90vw] object-contain'
							/>

							{/* Close */}
							<button onClick={() => setActiveIndex(null)} className='absolute top-6 right-6 text-white/70 hover:text-white'>
								<X size={28} />
							</button>

							{/* Prev */}
							<button onClick={() => setActiveIndex((i) => (i! - 1 + images.length) % images.length)} className='absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white'>
								<ChevronLeft size={36} />
							</button>

							{/* Next */}
							<button onClick={() => setActiveIndex((i) => (i! + 1) % images.length)} className='absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white'>
								<ChevronRight size={36} />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
