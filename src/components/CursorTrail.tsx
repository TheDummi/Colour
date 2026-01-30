/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

type Point = {
	x: number;
	y: number;
	id: number;
};

export default function CursorTrail() {
	const [points, setPoints] = useState<Point[]>([]);
	const idRef = useRef(0);
	const rafRef = useRef<number | null>(null);
	const lastPos = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			lastPos.current = { x: e.clientX, y: e.clientY };

			if (rafRef.current) return;

			rafRef.current = requestAnimationFrame(() => {
				if (!lastPos.current) return;

				setPoints((prev) => [
					...prev.slice(-10),
					{
						x: lastPos.current!.x,
						y: lastPos.current!.y,
						id: idRef.current++,
					},
				]);

				rafRef.current = null;
			});
		};

		window.addEventListener('mousemove', onMove);
		return () => {
			window.removeEventListener('mousemove', onMove);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div className='pointer-events-none fixed inset-0 z-[9999]'>
			{points.map((p) => (
				<motion.div
					key={p.id}
					initial={{ opacity: 0.5, scale: 1 }}
					animate={{ opacity: 0, scale: 0.3 }}
					transition={{ duration: 0.7, ease: 'easeOut' }}
					style={{
						position: 'absolute',
						left: p.x,
						top: p.y,
						width: 10,
						height: 10,
						borderRadius: '9999px',
						background: 'radial-gradient(circle, rgba(255,255,255,0.7), transparent)',
						transform: 'translate(-50%, -50%)',
					}}
				/>
			))}
		</div>
	);
}
