/** @format */

import './globals.css';

import { AdminProvider } from '@/components/AdminProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import Player from '@/components/Player';
import { PlayerProvider } from '@/components/PlayerProvider';
import SessionProvider from '@/components/SessionProvider';
import { SidebarProvider } from '@/components/SidebarProvider';
import SpaceshipPromo from '@/components/Spaceship';
import Starfield from '@/components/StarField';

export const metadata: Metadata = {
	title: 'Colour',
	description: 'Colour, the one and only.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className='min-h-screen flex flex-col text-white'>
				<SessionProvider>
					<AdminProvider>
						<SidebarProvider>
							<PlayerProvider>
								<Starfield />
								<SpaceshipPromo />
								<Header />

								<main className='min-h-screen flex-1 px-4 sm:px-8 py-10'>
									<div className='mx-auto max-w-7xl rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl p-6 sm:p-10'>{children}</div>
								</main>

								<Footer />
								<Player />
							</PlayerProvider>
						</SidebarProvider>
					</AdminProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
