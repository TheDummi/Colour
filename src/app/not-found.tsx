/** @format */
'use client';

import { motion } from 'framer-motion';

export default function NotFound() {
	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center gap-10 text-center'>
			{/* Guitarist */}
			<motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className='w-56 h-56'>
				<svg viewBox='0 0 240 240' className='w-full h-full' fill='none' stroke='white' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round'>
					{/* Whole body sway */}
					<motion.g
						animate={{ rotate: [-2, 2, -2] }}
						style={{
							transformOrigin: '120px 120px',
							transformBox: 'fill-box',
						}}
						transition={{
							duration: 2.4,
							repeat: Infinity,
							ease: 'easeInOut',
						}}>
						{/* Head */}
						<motion.circle
							cx='120'
							cy='40'
							r='16'
							animate={{ y: [0, 3, 0] }}
							transition={{
								duration: 0.8,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>

						{/* Neck */}
						<line x1='120' y1='56' x2='120' y2='80' />

						{/* Torso */}
						<line x1='120' y1='80' x2='120' y2='140' />

						{/* Guitar body */}
						<ellipse cx='158' cy='122' rx='28' ry='20' />
						<line x1='138' y1='112' x2='178' y2='132' />

						{/* Guitar neck */}
						<line x1='178' y1='122' x2='220' y2='104' />

						{/* Fretting arm (static) */}
						<line x1='120' y1='95' x2='175' y2='120' />

						{/* Strumming arm (shoulder → elbow → hand) */}
						<motion.g
							animate={{ rotate: [-18, 22, -18] }}
							style={{
								transformOrigin: '120px 100px',
								transformBox: 'fill-box',
							}}
							transition={{
								duration: 0.35,
								repeat: Infinity,
								ease: 'easeInOut',
							}}>
							{/* Upper arm */}
							<line x1='120' y1='100' x2='142' y2='118' />
							{/* Forearm */}
							<line x1='142' y1='118' x2='160' y2='138' />
						</motion.g>

						{/* Legs */}
						<line x1='120' y1='140' x2='95' y2='205' />
						<line x1='120' y1='140' x2='145' y2='205' />
					</motion.g>
				</svg>
			</motion.div>

			{/* Text */}
			<motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='text-2xl font-semibold'>
				404
			</motion.h1>

			<motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className='max-w-md text-white/70'>
				This page doesn’t exist. The guitarist is still absolutely committed.
			</motion.p>

			<motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} href='/' className='rounded-xl bg-white/10 hover:bg-white/20 transition px-6 py-2 backdrop-blur'>
				Return home
			</motion.a>
		</div>
	);
}
