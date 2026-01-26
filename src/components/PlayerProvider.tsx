/** @format */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Track = {
	id: string;
	name: string;
	artist: string;
	image?: string;
	url: string;
};

type PlayerContextType = {
	tracks: Track[];
	current: Track | null;
	index: number;
	visible: boolean;
	showPlayer: () => void;
	hidePlayer: () => void;
	next: () => void;
	prev: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [tracks, setTracks] = useState<Track[]>([]);
	const [index, setIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	const current = tracks[index] ?? null;

	/* ----------------------------- Load tracks ----------------------------- */

	useEffect(() => {
		fetch('/api/radio')
			.then((r) => r.json())
			.then((d) => setTracks(d.tracks ?? []))
			.catch(() => {});
	}, []);

	/* ----------------------------- Navigation ----------------------------- */

	const next = () => {
		if (!tracks.length) return;
		setIndex((i) => (i + 1) % tracks.length);
	};

	const prev = () => {
		if (!tracks.length) return;
		setIndex((i) => (i - 1 + tracks.length) % tracks.length);
	};

	const showPlayer = () => setVisible(true);
	const hidePlayer = () => setVisible(false);

	return (
		<PlayerContext.Provider
			value={{
				tracks,
				current,
				index,
				visible,
				showPlayer,
				hidePlayer,
				next,
				prev,
			}}>
			{children}
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const ctx = useContext(PlayerContext);
	if (!ctx) {
		throw new Error('usePlayer must be used inside PlayerProvider');
	}
	return ctx;
}
