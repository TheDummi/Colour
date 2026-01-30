/** @format */
'use client';

import About from '@/components/admin/About';
import Albums from '@/components/admin/Albums';
import Events from '@/components/admin/Events';
import Media from '@/components/admin/Media';
import Users from '@/components/admin/Users';
import { useAdminView } from '@/components/AdminProvider';
import { useSession } from 'next-auth/react';

function NewsletterPanel() {
	return (
		<div className='flex flex-col gap-4'>
			<h2 className='text-xl font-semibold'>Newsletter</h2>
			<p className='text-white/60'>Create and send newsletters.</p>
		</div>
	);
}

function AdminContent() {
	const { view } = useAdminView();

	if (view === 'users') return <Users />;
	if (view === 'albums') return <Albums />;
	if (view === 'about') return <About />;
	if (view === 'events') return <Events />;
	if (view === 'media') return <Media />;
	if (view === 'newsletter') return <NewsletterPanel />;

	return <div className='text-white/40 text-sm'>Select a panel from the sidebar.</div>;
}

export default function AdminPage() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <div className='text-white/60'>Loading…</div>;
	}

	if (!session) {
		return <div className='text-white/60'>Sign in from the sidebar to access admin tools.</div>;
	}

	return (
		<div className='flex flex-col gap-8'>
			<h1 className='text-2xl font-semibold'>Admin Dashboard</h1>

			<AdminContent />
		</div>
	);
}
