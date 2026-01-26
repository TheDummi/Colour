/** @format */
'use client';

import { Calendar, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';

type Event = {
	_id: string;
	title: string;
	description: string;
	location: string;
	date: string;
	link: string;
	image: string;
};

export default function EventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [now, setNow] = useState(new Date().getTime());

	/* ---------------------------- Live clock ---------------------------- */

	useEffect(() => {
		const id = setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => clearInterval(id);
	}, []);

	/* ---------------------------- Load events ---------------------------- */

	useEffect(() => {
		const load = async () => {
			const res = await fetch('/api/events');
			const data = await res.json();

			const sorted = (data.events ?? []).sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());

			setEvents(sorted);
			setLoading(false);
		};
		load();
	}, []);

	/* ------------------------- Derived lists ------------------------- */

	const upcoming = useMemo(() => {
		return events.filter((e) => new Date(e.date).getTime() >= now);
	}, [events, now]);

	const past = useMemo(() => {
		return events.filter((e) => new Date(e.date).getTime() < now).reverse();
	}, [events, now]);

	/* ------------------------- Helpers ------------------------- */

	const formatDateTime = (iso: string) => {
		const d = new Date(iso);
		return d.toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		});
	};

	const getCountdown = (iso: string) => {
		const diff = new Date(iso).getTime() - now;
		if (diff <= 0) return 'Live';

		const totalSeconds = Math.floor(diff / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);

		if (days > 0) return `${days}d ${hours}h`;
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	const openMaps = (address: string) => {
		const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		window.open(url, '_blank');
	};

	const formatICSDate = (iso: string) => {
		const d = new Date(iso);
		return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
	};

	const openGoogleCalendar = (event: Event) => {
		const start = formatICSDate(event.date);
		const end = formatICSDate(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString());

		const params = new URLSearchParams({
			action: 'TEMPLATE',
			text: event.title,
			dates: `${start}/${end}`,
			details: event.description?.replace(/<[^>]+>/g, '') || '',
			location: event.location || '',
		});

		window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
	};

	/* ------------------------- States ------------------------- */

	if (loading) {
		return <div className='text-white/50'>Loading events…</div>;
	}

	if (!events.length) {
		return <div className='text-white/50 text-center'>No events found.</div>;
	}

	return (
		<div className='flex flex-col gap-16'>
			<h1 className='text-2xl font-semibold'>Events</h1>

			{/* Upcoming */}
			<section className='flex flex-col gap-8'>
				<h2 className='text-xl font-medium'>Upcoming</h2>

				{upcoming.length === 0 && <div className='text-white/40 text-sm'>No upcoming events.</div>}

				<div className='grid md:grid-cols-2 gap-8'>
					{upcoming.map((e) => (
						<motion.div
							key={e._id}
							initial={{ opacity: 0, y: 12 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className='rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 flex flex-col gap-3'>
							{e.image && <img src={e.image} className='rounded-lg object-cover' />}

							<div className='font-medium text-lg'>{e.title}</div>

							<div className='text-xs text-white/60 flex flex-wrap items-center gap-2'>
								<span>{formatDateTime(e.date)}</span>

								{e.location && (
									<>
										<span>·</span>
										<span>{e.location}</span>
									</>
								)}
							</div>

							<div className='text-xs text-purple-300'>Starts in {getCountdown(e.date)}</div>

							{e.description && (
								<div
									className='text-sm text-white/70 prose prose-invert max-w-none'
									dangerouslySetInnerHTML={{
										__html: e.description,
									}}
								/>
							)}

							<div className='flex flex-wrap items-center gap-4 pt-2'>
								{e.location && (
									<button onClick={() => openMaps(e.location)} className='text-sm underline text-blue-300 hover:text-blue-200'>
										<Navigation size={16} />
									</button>
								)}

								<button onClick={() => openGoogleCalendar(e)} className='text-sm underline text-green-300 hover:text-green-200'>
									<Calendar size={16} />
								</button>

								{e.link && (
									<a href={e.link} target='_blank' className='text-sm underline text-white/80 hover:text-white'>
										Event details →
									</a>
								)}
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* Past */}
			<section className='flex flex-col gap-8'>
				<h2 className='text-xl font-medium'>Past</h2>

				{past.length === 0 && <div className='text-white/40 text-sm'>No past events.</div>}

				<div className='grid md:grid-cols-2 gap-8'>
					{past.map((e) => (
						<motion.div
							key={e._id}
							initial={{ opacity: 0, y: 12 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className='rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 flex flex-col gap-3 opacity-70'>
							{e.image && <img src={e.image} className='rounded-lg object-cover' />}

							<div className='font-medium text-lg'>{e.title}</div>

							<div className='text-xs text-white/60 flex flex-wrap items-center gap-2'>
								<span>{formatDateTime(e.date)}</span>

								{e.location && (
									<>
										<span>·</span>
										<span>{e.location}</span>
									</>
								)}
							</div>

							{e.description && (
								<div
									className='text-sm text-white/70 prose prose-invert max-w-none'
									dangerouslySetInnerHTML={{
										__html: e.description,
									}}
								/>
							)}

							<div className='flex flex-wrap items-center gap-4 pt-2'>
								{e.link && (
									<a href={e.link} target='_blank' className='text-sm underline text-white/80 hover:text-white'>
										Event details →
									</a>
								)}
							</div>
						</motion.div>
					))}
				</div>
			</section>
		</div>
	);
}
