/** @format */
'use client';

import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useSidebar } from './SidebarProvider';

export default function Header() {
	const { toggleSidebar } = useSidebar();

	return (
		<>
			<header className='sticky top-0 z-30 h-14 grid grid-cols-3 items-center px-4 bg-black/40 backdrop-blur border-b border-white/10 text-white'>
				{/* Left: Hamburger */}
				<div className='flex items-center'>
					<button onClick={toggleSidebar} className='p-2 rounded-md hover:bg-white/10 transition' aria-label='Open menu'>
						<Menu size={22} />
					</button>
				</div>

				{/* Center: Logo */}
				<div className='flex justify-center'>
					<img src='/colour_logo.svg' alt='Logo' className='h-7 w-auto select-none' />
				</div>

				{/* Right: Empty spacer */}
				<div />
			</header>

			{/* Sidebar lives here */}
			<Sidebar />
		</>
	);
}
