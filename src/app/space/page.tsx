/** @format */
'use client';

import { motion } from 'framer-motion';

export default function SpacePage() {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className=''>
			<div className='text-sm tracking-wide uppercase flex justify-center'>{"You're"} in space!</div>
		</motion.div>
	);
}
