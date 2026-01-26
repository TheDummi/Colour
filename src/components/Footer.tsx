/** @format */
'use client';

import { Instagram, Music, Twitter, Youtube } from 'lucide-react';

const socials = [
	{
		href: 'https://www.instagram.com/colourtheoneandonly',
		label: 'Instagram',
		icon: Instagram,
	},
	{
		href: 'https://www.youtube.com/@Colourtheoneandonly',
		label: 'YouTube',
		icon: Youtube,
	},
	{
		href: 'https://open.spotify.com/artist/199B2dCRTpPAPqdoD5mKrk',
		label: 'Spotify',
		icon: Music,
	},
];

export default function Footer() {
	return (
		<footer className='relative z-10 border-t border-white/10 bg-black/40 backdrop-blur text-white pb-36'>
			<div className='mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
				{/* Copyright */}
				<div className='text-xs text-white/60'>© {new Date().getFullYear()} Colour. All rights reserved.</div>

				{/* Socials */}
				<div className='flex items-center gap-4'>
					{socials.map((s) => {
						const Icon = s.icon;
						return (
							<a key={s.label} href={s.href} target='_blank' rel='noreferrer' aria-label={s.label} className='p-2 rounded-md hover:bg-white/10 transition'>
								<Icon size={18} />
							</a>
						);
					})}
				</div>
			</div>
		</footer>
	);
}
