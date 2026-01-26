/** @format */
'use client';

import { createContext, useContext, useState } from 'react';

type AdminView = 'users' | 'albums' | 'newsletter' | 'about' | 'events';

type AdminViewContextType = {
	view: AdminView;
	setView: (view: AdminView) => void;
};

const AdminViewContext = createContext<AdminViewContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
	const [view, setView] = useState<AdminView>('users');

	return <AdminViewContext.Provider value={{ view, setView }}>{children}</AdminViewContext.Provider>;
}

export function useAdminView() {
	const ctx = useContext(AdminViewContext);
	if (!ctx) {
		throw new Error('useAdminView must be used inside AdminViewProvider');
	}
	return ctx;
}
