/** @format */
'use client';

import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
	open: boolean;
	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);

	const openSidebar = () => setOpen(true);
	const closeSidebar = () => setOpen(false);
	const toggleSidebar = () => setOpen((o) => !o);

	return <SidebarContext.Provider value={{ open, openSidebar, closeSidebar, toggleSidebar }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) {
		throw new Error('useSidebar must be used inside SidebarProvider');
	}
	return ctx;
}
