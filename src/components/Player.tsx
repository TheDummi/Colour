/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { ChevronDown } from 'lucide-react';
import { usePlayer } from './PlayerProvider';

export default function Player() {
	const { current, tracks, next, prev, visible, hidePlayer } = usePlayer();

	if (!tracks.length || !current) return null;

	const embedUrl = current.url.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/');

	return (
		<AnimatePresence>
			{visible && (
				<div className='fixed bottom-0 left-0 right-0 z-50 pointer-events-none'>
					<div className='mx-auto max-w-7xl px-4 pb-4 pointer-events-auto'>
						<motion.div
							initial={{ y: 140, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 140, opacity: 0 }}
							transition={{
								type: 'spring',
								stiffness: 260,
								damping: 28,
							}}
							className='relative flex items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-xl p-3'>
							{/* Hide */}
							<button onClick={hidePlayer} className='absolute -top-3 right-3 rounded-full bg-black/70 hover:bg-black/90 transition p-1 text-white' aria-label='Hide player'>
								<ChevronDown size={16} />
							</button>

							{/* Prev */}
							<button onClick={prev} className='rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm text-white'>
								◀
							</button>

							{/* Embed */}
							<div className='relative overflow-hidden rounded-xl border border-white/10 bg-black'>
								<div className='pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/5' />

								<iframe key={current.id} src={embedUrl} width='320' height='80' className='block' allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' />
							</div>

							{/* Next */}
							<button onClick={next} className='rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm text-white'>
								▶
							</button>
						</motion.div>
					</div>
				</div>
			)}
		</AnimatePresence>
	);
}
