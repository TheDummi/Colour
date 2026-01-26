/** @format */
'use client';

import { useEffect, useMemo, useState } from 'react';

import { Music } from 'lucide-react';
import { motion } from 'framer-motion';

type Album = {
	id: string;
	name: string;
	image: string;
	description: string;
	releaseDate: string;
	url: string;
};

type About = {
	description: string;
	image: string;
};

type BandMember = {
	_id: string;
	displayName: string;
	bio: string;
	image: string;
	isBandMember: boolean;
};

export default function Home() {
	const [albums, setAlbums] = useState<Album[]>([]);
	const [about, setAbout] = useState<About | null>(null);
	const [members, setMembers] = useState<BandMember[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		load();
	}, []);

	const load = async () => {
		try {
			const [albumsRes, aboutRes, usersRes] = await Promise.all([fetch('/api/albums'), fetch('/api/about'), fetch('/api/users')]);

			const albumsData = await albumsRes.json();
			const aboutData = await aboutRes.json();
			const usersData = await usersRes.json();

			setAlbums(albumsData.albums ?? []);
			setAbout(aboutData.about ?? null);

			const bandMembers = (usersData.users ?? []).filter((u: BandMember) => u.isBandMember) ?? [];

			setMembers(bandMembers);
		} finally {
			setLoading(false);
		}
	};

	const latest = useMemo(() => {
		if (!albums.length) return null;

		return [...albums].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];
	}, [albums]);

	return (
		<div className='flex flex-col gap-24'>
			{/* Hero */}
			<section className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
				<motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className='text-4xl sm:text-6xl font-bold tracking-tight'>
					<img src='/colour_logo.svg' alt='' />
				</motion.h1>

				<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }} className='mt-10 flex gap-4'>
					<a href='/music' className='rounded-xl bg-white/15 hover:bg-white/25 transition px-6 py-2 backdrop-blur'>
						Listen
					</a>

					<a href='/events' className='rounded-xl border border-white/20 hover:bg-white/10 transition px-6 py-2'>
						Live
					</a>
				</motion.div>
			</section>

			{/* Divider */}
			<div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />

			{/* About */}
			<section className='grid md:grid-cols-2 gap-12 items-center'>
				{/* Text */}
				<div>
					<h2 className='text-xl font-semibold mb-4 tracking-wide'>About</h2>

					{about?.description ? <p className='text-white/70 leading-relaxed'>{about.description}</p> : <div className='text-white/40 text-sm'>No description yet.</div>}
				</div>

				{/* Image */}
				{about?.image ? <img src={about.image} className='rounded-xl object-cover border border-white/10' /> : <div className='h-64 rounded-xl bg-white/5 border border-white/10 backdrop-blur' />}
			</section>

			{/* Band members */}
			{members.length > 0 && (
				<>
					<div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />

					<section className='flex flex-col gap-10'>
						<h2 className='text-xl font-semibold tracking-wide'>Band</h2>

						<div className='grid sm:grid-cols-2 md:grid-cols-3 gap-8'>
							{members.map((m) => (
								<motion.div
									key={m._id}
									initial={{
										opacity: 0,
										y: 12,
									}}
									whileInView={{
										opacity: 1,
										y: 0,
									}}
									viewport={{ once: true }}
									transition={{
										duration: 0.5,
									}}
									className='flex flex-col gap-3 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur'>
									{m.image && <img src={m.image} className='rounded-lg w-full' />}

									<div className='font-medium'>{m.displayName}</div>

									<div className='text-sm text-white/70 leading-relaxed prose prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: m.bio }} />
								</motion.div>
							))}
						</div>
					</section>
				</>
			)}

			{/* Divider */}
			<div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />

			{/* Latest */}
			<section className='grid md:grid-cols-2 gap-12 items-center'>
				{/* Art */}
				<div className='order-2 md:order-1'>
					{latest && (
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							whileInView={{
								opacity: 1,
								scale: 1,
							}}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className='relative group w-full max-w-md'>
							<div className='absolute -inset-3 rounded-xl bg-purple-500/30 blur-2xl opacity-40 group-hover:opacity-70 transition' />

							<img src={latest.image} className='relative w-full rounded-xl object-cover' />
						</motion.div>
					)}

					{loading && <div className='h-64 rounded-xl bg-white/5 border border-white/10 backdrop-blur animate-pulse' />}
				</div>

				{/* Info */}
				<div className='order-1 md:order-2 flex flex-col gap-4'>
					<h2 className='text-xl font-semibold tracking-wide'>Latest Release</h2>

					{latest && (
						<>
							<div className='text-lg font-medium'>{latest.name}</div>

							{latest.description && <p className='text-white/70 leading-relaxed'>{latest.description}</p>}

							<a href={latest.url} target='_blank' className='inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition'>
								<Music size={16} />
								Listen on Spotify
							</a>
						</>
					)}

					{!loading && !latest && <div className='text-white/40 text-sm'>No releases found.</div>}
				</div>
			</section>
		</div>
	);
}
