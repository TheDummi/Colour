/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type Event = {
	_id: string;
	title: string;
	description: string;
	location: string;
	date: string;
	image: string;
};

export default function SpaceshipPromo() {
	const [events, setEvents] = useState<Event[]>([]);
	const [active, setActive] = useState(false);
	const [selected, setSelected] = useState<Event | null>(null);
	const [flightKey, setFlightKey] = useState(0);
	const [direction, setDirection] = useState<'left' | 'right'>('left');
	const [y, setY] = useState(0);

	/* ---------------------- Load upcoming events ---------------------- */

	useEffect(() => {
		const load = async () => {
			const res = await fetch('/api/events');
			const data = await res.json();

			const upcoming = (data.events ?? []).filter((e: Event) => new Date(e.date).getTime() > Date.now());

			setEvents(upcoming);
		};

		load();
	}, []);

	const nextEvent = useMemo(() => {
		if (!events.length) return null;
		return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
	}, [events]);

	/* ---------------------- Random flybys ---------------------- */

	useEffect(() => {
		if (!nextEvent) return;

		let timeout: NodeJS.Timeout;

		const spawn = () => {
			const dir = Math.random() > 0.5 ? 'left' : 'right';

			setDirection(dir);
			setY(Math.random() * (window.innerHeight - 200));
			setFlightKey((k) => k + 1);
			setActive(true);

			// Kill ship after crossing screen
			setTimeout(() => {
				setActive(false);
			}, 9000);

			// Schedule next random flyby
			const nextDelay = 6000 + Math.random() * 20000;
			timeout = setTimeout(spawn, nextDelay);
		};

		// Initial random delay
		timeout = setTimeout(spawn, 3000 + Math.random() * 8000);

		return () => clearTimeout(timeout);
	}, [nextEvent]);

	if (!nextEvent) return null;

	return (
		<>
			{/* Ship */}
			<AnimatePresence>
				{active && (
					<motion.div
						key={flightKey}
						initial={{
							x: direction === 'left' ? -300 : window.innerWidth + 300,
							y,
							rotate: 90, // rotate sprite so it faces horizontally
							scaleX: direction === 'right' ? -1 : 1,
						}}
						animate={{
							x: direction === 'left' ? window.innerWidth + 300 : -300,
							rotate: 90,
							scaleX: direction === 'right' ? -1 : 1,
						}}
						transition={{
							duration: 8,
							ease: 'linear',
						}}
						onClick={() => setSelected(nextEvent)}
						className='fixed top-0 z-30 cursor-pointer pointer-events-auto'
						style={{ willChange: 'transform' }}>
						<img src='/spaceship.png' alt='Event ship' draggable={false} className='w-32 drop-shadow-[0_0_18px_rgba(180,120,255,0.8)] select-none' />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Modal */}
			<AnimatePresence>
				{selected && (
					<>
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className='fixed inset-0 z-40 bg-black' />

						<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className='fixed inset-0 z-50 flex items-center justify-center px-4'>
							<div className='max-w-md w-full rounded-xl bg-black/90 border border-white/10 backdrop-blur p-6 flex flex-col gap-3'>
								<div className='text-lg font-semibold'>🚀 Upcoming Event</div>

								<div className='font-medium'>{selected.title}</div>

								<div className='text-xs text-white/60'>{new Date(selected.date).toLocaleString()}</div>

								{selected.image && <img src={selected.image} className='rounded-lg object-cover' />}

								{selected.description && (
									<div
										className='text-sm text-white/70 prose prose-invert max-w-none'
										dangerouslySetInnerHTML={{
											__html: selected.description,
										}}
									/>
								)}

								<button onClick={() => setSelected(null)} className='self-end text-sm text-white/60 hover:text-white'>
									Close
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
