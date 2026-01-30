/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Camera, Home, LogIn, LogOut, Music, Newspaper, Shield, Users } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

import Link from 'next/link';
import { useAdminView } from './AdminProvider';
import { usePathname } from 'next/navigation';
import { usePlayer } from './PlayerProvider';
import { useSidebar } from './SidebarProvider';

export default function Sidebar() {
	const { open, closeSidebar } = useSidebar();
	const pathname = usePathname();
	const { data: session } = useSession();
	const { setView } = useAdminView();
	const { visible, showPlayer } = usePlayer();

	const isAdminRoute = pathname === '/admin';
	const isSignedIn = !!session;

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={closeSidebar} className='fixed inset-0 z-40 bg-black' />

					{/* Panel */}
					<motion.aside
						initial={{ x: '-100%' }}
						animate={{ x: 0 }}
						exit={{ x: '-100%' }}
						transition={{
							type: 'spring',
							stiffness: 260,
							damping: 30,
						}}
						className='fixed left-0 top-0 bottom-0 z-50 w-72 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6 text-white flex flex-col'>
						{/* Public navigation */}
						<nav className='flex flex-col gap-3 text-sm'>
							<Link href='/' className='flex gap-2' onClick={closeSidebar}>
								<Home size={16} />
								Home
							</Link>
							<Link href='/music' className='flex gap-2' onClick={closeSidebar}>
								<Music size={16} />
								Music
							</Link>
							<Link href='/events' className='flex gap-2' onClick={closeSidebar}>
								<Calendar size={16} />
								Events
							</Link>

							<Link href='/colourfest' className='flex gap-2' onClick={closeSidebar}>
								<Music size={16} />
								Colourfest
							</Link>
							<Link href='/space' className='flex gap-2' onClick={closeSidebar}>
								Space?
							</Link>
						</nav>

						{/* Admin navigation (only on /admin + signed in) */}
						{isSignedIn && isAdminRoute && (
							<div className='mt-8 border-t border-white/10 pt-4 flex flex-col gap-3 text-sm'>
								<div className='text-xs uppercase tracking-wide text-white/50'>Admin</div>

								<button
									onClick={() => {
										setView('users');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Users size={16} />
									Users
								</button>

								<button
									onClick={() => {
										setView('about');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Shield size={16} />
									About
								</button>

								<button
									onClick={() => {
										setView('albums');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Music size={16} />
									Albums
								</button>

								<button
									onClick={() => {
										setView('events');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Calendar size={16} />
									Events
								</button>
								<button
									onClick={() => {
										setView('media');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Camera size={16} />
									Media
								</button>

								<button
									onClick={() => {
										setView('newsletter');
										closeSidebar();
									}}
									className='flex items-center gap-2 text-left hover:text-white/90'>
									<Newspaper size={16} />
									Newsletter
								</button>
							</div>
						)}

						<div className='flex-1' />

						{/* Auth controls */}
						<div className='border-t border-white/10 pt-4 flex flex-col gap-3'>
							{/* Show Player */}
							{!visible && (
								<button
									onClick={() => {
										showPlayer();
										closeSidebar();
									}}
									className='flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm'>
									Show Player
								</button>
							)}

							{/* Auth controls */}
							{!isSignedIn ? (
								<button
									onClick={() => {
										signIn();
										closeSidebar();
									}}
									className='flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm'>
									<LogIn size={16} />
									Sign in
								</button>
							) : (
								<>
									<Link href='/admin' className='flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm'>
										<Shield size={16} />
										Admin
									</Link>

									<button
										onClick={() => {
											signOut();
											closeSidebar();
										}}
										className='flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 transition px-3 py-2 text-sm'>
										<LogOut size={16} />
										Sign out
									</button>
								</>
							)}
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
