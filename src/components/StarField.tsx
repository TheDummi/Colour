/** @format */
'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

type Star = {
	x: number;
	y: number;
	z: number;
	speed: number;
};

type ShootingStar = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
};

export default function Starfield() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { open: sidebarOpen } = useSidebar();
	const pathname = usePathname();

	const warpBoost = useRef(1);
	const lastPath = useRef(pathname);

	// Parallax state
	const targetOffset = useRef({ x: 0, y: 0 });
	const currentOffset = useRef({ x: 0, y: 0 });

	// Camera roll
	const targetRoll = useRef(0);
	const currentRoll = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current as any;
		if (!canvas) return;

		const ctx = canvas.getContext('2d') as any;
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let centerX = width / 2;
		let centerY = height / 2;

		canvas.width = width;
		canvas.height = height;

		const STAR_COUNT = 900;
		const DEPTH = 2400;
		const OVERSCAN_SCALE = 1.08; // prevents edge gaps during rotation

		const stars: Star[] = [];
		const shootingStars: ShootingStar[] = [];

		function randomStar(): Star {
			return {
				x: (Math.random() - 0.5) * width * 2,
				y: (Math.random() - 0.5) * height * 2,
				z: Math.random() * DEPTH + 1,
				speed: 2 + Math.random() * 3,
			};
		}

		for (let i = 0; i < STAR_COUNT; i++) {
			stars.push(randomStar());
		}

		function spawnShootingStar() {
			shootingStars.push({
				x: Math.random() * width,
				y: Math.random() * height * 0.5,
				vx: 12 + Math.random() * 8,
				vy: 6 + Math.random() * 4,
				life: 40 + Math.random() * 20,
			});
		}

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			centerX = width / 2;
			centerY = height / 2;
			canvas.width = width;
			canvas.height = height;
		}

		window.addEventListener('resize', resize);

		/* ------------------------- Pointer Parallax ------------------------- */

		function handlePointerMove(e: PointerEvent) {
			const nx = (e.clientX / width - 0.5) * 2;
			const ny = (e.clientY / height - 0.5) * 2;

			targetOffset.current.x = nx * 80;
			targetOffset.current.y = ny * 60;

			targetRoll.current = nx * 0.05;
		}

		window.addEventListener('pointermove', handlePointerMove);

		/* ------------------------- Mobile Gyroscope ------------------------- */

		function handleDeviceOrientation(e: DeviceOrientationEvent) {
			if (e.gamma == null || e.beta == null) return;

			const nx = Math.max(-1, Math.min(1, e.gamma / 30));
			const ny = Math.max(-1, Math.min(1, e.beta / 30));

			targetOffset.current.x = nx * 80;
			targetOffset.current.y = ny * 60;
			targetRoll.current = nx * 0.05;
		}

		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			// @ts-ignore
			typeof DeviceOrientationEvent.requestPermission === 'function'
		) {
			const request = () => {
				// @ts-ignore
				DeviceOrientationEvent.requestPermission().catch(() => {});
				window.removeEventListener('click', request);
			};
			window.addEventListener('click', request);
		}

		window.addEventListener('deviceorientation', handleDeviceOrientation);

		/* --------------------------- Nebula draw --------------------------- */

		function drawNebula() {
			const gradient = ctx.createRadialGradient(centerX + currentOffset.current.x * 0.3, centerY + currentOffset.current.y * 0.3, 0, centerX, centerY, Math.max(width, height));

			gradient.addColorStop(0, 'rgba(90,50,140,0.14)');
			gradient.addColorStop(0.4, 'rgba(40,90,160,0.10)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);
		}

		/* ------------------------------- Loop ------------------------------- */

		function draw() {
			if (!ctx) return;

			// Warp decay
			warpBoost.current += (1 - warpBoost.current) * 0.08;

			// Parallax inertia
			currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.05;
			currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.05;

			// Roll inertia
			currentRoll.current += (targetRoll.current - currentRoll.current) * 0.04;

			ctx.save();

			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, width, height);

			// Overscan + camera roll
			ctx.translate(centerX, centerY);
			ctx.scale(OVERSCAN_SCALE, OVERSCAN_SCALE);
			ctx.rotate(currentRoll.current);
			ctx.translate(-centerX, -centerY);

			drawNebula();

			// Stars
			for (let i = 0; i < stars.length; i++) {
				const star = stars[i];

				star.z -= star.speed * warpBoost.current;

				if (star.z <= 1) {
					stars[i] = randomStar();
					continue;
				}

				const scale = 320 / star.z;

				const x = star.x * scale + centerX + currentOffset.current.x * scale * 0.6;

				const y = star.y * scale + centerY + currentOffset.current.y * scale * 0.6;

				if (x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;

				const radius = Math.max(0.4, 1.6 * scale);
				const alpha = Math.min(1, 0.3 + scale);

				ctx.beginPath();
				ctx.fillStyle = `rgba(255,255,255,${alpha})`;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();

				if (warpBoost.current > 1.3) {
					ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x - star.x * scale * 0.03, y - star.y * scale * 0.03);
					ctx.stroke();
				}
			}

			// Shooting stars
			for (let i = shootingStars.length - 1; i >= 0; i--) {
				const s = shootingStars[i];

				ctx.strokeStyle = 'rgba(255,255,255,0.85)';
				ctx.lineWidth = 2;

				ctx.beginPath();
				ctx.moveTo(s.x, s.y);
				ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
				ctx.stroke();

				s.x += s.vx;
				s.y += s.vy;
				s.life--;

				if (s.life <= 0) {
					shootingStars.splice(i, 1);
				}
			}

			if (Math.random() < 0.003) {
				spawnShootingStar();
			}

			// Sidebar dim
			if (sidebarOpen) {
				ctx.fillStyle = 'rgba(0,0,0,0.35)';
				ctx.fillRect(0, 0, width, height);
			}

			ctx.restore();
			requestAnimationFrame(draw);
		}

		draw();

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('deviceorientation', handleDeviceOrientation);
		};
	}, [sidebarOpen]);

	/* ----------------------- Warp on route change ----------------------- */

	useEffect(() => {
		if (pathname !== lastPath.current) {
			warpBoost.current = 4;
			lastPath.current = pathname;
		}
	}, [pathname]);

	return <canvas ref={canvasRef} className='fixed inset-0 -z-10 h-full w-full pointer-events-none' />;
}
