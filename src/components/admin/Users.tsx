/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

type User = {
	_id: string;
	email: string;
	name?: string;
	role: 'admin' | 'editor';

	isBandMember: boolean;
	displayName: string;
	bio: string;
	image: string;
};

export default function Users() {
	const { data: session } = useSession();

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');

	const [editUser, setEditUser] = useState<User | null>(null);
	const [deleteUser, setDeleteUser] = useState<User | null>(null);

	const [name, setName] = useState('');
	const [role, setRole] = useState<'admin' | 'editor'>('editor');
	const [newPassword, setNewPassword] = useState('');

	// Band fields
	const [isBandMember, setIsBandMember] = useState(false);
	const [displayName, setDisplayName] = useState('');
	const [bio, setBio] = useState('');
	const [image, setImage] = useState('');

	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);

	const [createEmail, setCreateEmail] = useState('');
	const [createName, setCreateName] = useState('');
	const [createPassword, setCreatePassword] = useState('');
	const [createRole, setCreateRole] = useState<'admin' | 'editor'>('editor');
	const [createError, setCreateError] = useState('');

	const loadUsers = async () => {
		setLoading(true);
		const res = await fetch('/api/users');
		const data = await res.json();
		setUsers(data.users ?? []);
		setLoading(false);
	};

	useEffect(() => {
		loadUsers();
	}, []);

	const filteredUsers = useMemo(() => {
		return users.filter((u) => `${u.name ?? ''} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
	}, [users, search]);

	/* ----------------------------- Create user ----------------------------- */

	const createUser = async () => {
		if (creating) return;

		setCreateError('');
		setCreating(true);

		try {
			const res = await fetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: createEmail,
					name: createName,
					password: createPassword,
					role: createRole,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				setCreateError(data.error || 'Failed to create user');
				return;
			}

			setCreateEmail('');
			setCreateName('');
			setCreatePassword('');
			setCreateRole('editor');
			setCreateOpen(false);

			await loadUsers();
		} finally {
			setCreating(false);
		}
	};

	/* ------------------------------ Save user ------------------------------ */

	const saveUser = async () => {
		if (!editUser?._id || saving) return;

		setSaving(true);

		try {
			await fetch('/api/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: editUser._id,
					name,
					role,
					password: newPassword || undefined,

					// band fields
					isBandMember,
					displayName,
					bio,
					image,
				}),
			});

			setEditUser(null);
			setNewPassword('');
			await loadUsers();
		} finally {
			setSaving(false);
		}
	};

	/* ---------------------------- Delete user ----------------------------- */

	const confirmDelete = async () => {
		if (!deleteUser?._id || deleting) return;

		setDeleting(true);

		const id = deleteUser._id;

		// Optimistic UI
		setUsers((prev) => prev.filter((u) => u._id !== id));
		setDeleteUser(null);

		try {
			await fetch(`/api/users?id=${id}`, {
				method: 'DELETE',
			});
		} catch {
			await loadUsers();
		} finally {
			setDeleting(false);
		}
	};

	if (loading) return <div className='text-white/60'>Loading users…</div>;

	return (
		<div className='flex flex-col gap-6'>
			{/* Header */}
			<div className='flex items-center justify-between gap-4'>
				<h2 className='text-xl font-semibold'>Users</h2>

				<div className='flex items-center gap-3'>
					<input placeholder='Search users…' value={search} onChange={(e) => setSearch(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none w-64' />

					<button onClick={() => setCreateOpen(true)} className='rounded-lg bg-white/10 hover:bg-white/20 transition px-4 py-2 text-sm'>
						Add user
					</button>
				</div>
			</div>

			{/* User list */}
			<div className='flex flex-col gap-2'>
				{filteredUsers.map((u) => {
					const isSelf = u.email === session?.user?.email;

					return (
						<div key={u._id} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm'>
							<div className='flex flex-col'>
								<div className='font-medium flex items-center gap-2'>
									{u.name || 'Unnamed user'}

									<span className={`text-[10px] px-2 py-0.5 rounded-full border ${u.role === 'admin' ? 'border-purple-400/40 text-purple-300' : 'border-white/20 text-white/50'}`}>{u.role}</span>

									{u.isBandMember && <span className='text-[10px] px-2 py-0.5 rounded-full border border-green-400/40 text-green-300'>band</span>}

									{isSelf && <span className='text-[10px] text-green-400'>you</span>}
								</div>

								<div className='text-white/50 text-xs'>{u.email}</div>
							</div>

							<div className='flex items-center gap-3'>
								<button
									onClick={() => {
										setEditUser(u);
										setName(u.name ?? '');
										setRole(u.role);
										setIsBandMember(!!u.isBandMember);
										setDisplayName(u.displayName ?? '');
										setBio(u.bio ?? '');
										setImage(u.image ?? '');
									}}
									className='text-xs text-white/70 hover:text-white'>
									Edit
								</button>

								<button
									disabled={isSelf || deleting}
									onClick={() => !isSelf && setDeleteUser(u)}
									className={`text-xs ${isSelf || deleting ? 'text-white/20 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}>
									Delete
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{/* Create modal */}
			<AnimatePresence>
				{createOpen && (
					<>
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => !creating && setCreateOpen(false)} className='fixed inset-0 z-40 bg-black' />

						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className='fixed inset-0 z-50 flex items-center justify-center px-4'>
							<div className='w-full max-w-md rounded-xl border border-white/10 bg-black/90 backdrop-blur p-6 flex flex-col gap-4'>
								<h3 className='text-lg font-semibold'>Add user</h3>

								<input placeholder='Name' value={createName} disabled={creating} onChange={(e) => setCreateName(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none' />

								<input placeholder='Email' value={createEmail} disabled={creating} onChange={(e) => setCreateEmail(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none' />

								<input
									type='password'
									placeholder='Password'
									value={createPassword}
									disabled={creating}
									onChange={(e) => setCreatePassword(e.target.value)}
									className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none'
								/>

								<select value={createRole} disabled={creating} onChange={(e) => setCreateRole(e.target.value as 'admin' | 'editor')} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none'>
									<option value='editor'>Editor</option>
									<option value='admin'>Admin</option>
								</select>

								{createError && <div className='text-sm text-red-400'>{createError}</div>}

								<div className='flex justify-end gap-3 pt-2'>
									<button disabled={creating} onClick={() => setCreateOpen(false)} className='text-sm text-white/60 hover:text-white disabled:opacity-40'>
										Cancel
									</button>

									<button disabled={creating} onClick={createUser} className='rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition disabled:opacity-40'>
										{creating ? 'Creating…' : 'Create'}
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Edit modal */}
			<AnimatePresence>
				{editUser && (
					<>
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => !saving && setEditUser(null)} className='fixed inset-0 z-40 bg-black' />

						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className='fixed inset-0 z-50 flex items-center justify-center px-4'>
							<div className='w-full max-w-md rounded-xl border border-white/10 bg-black/90 backdrop-blur p-6 flex flex-col gap-4'>
								<h3 className='text-lg font-semibold'>Edit user</h3>

								<input placeholder='Name' value={name} disabled={saving} onChange={(e) => setName(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none' />

								<select value={role} disabled={saving} onChange={(e) => setRole(e.target.value as 'admin' | 'editor')} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none'>
									<option value='editor'>Editor</option>
									<option value='admin'>Admin</option>
								</select>

								{/* Band toggle */}
								<label className='flex items-center gap-3 text-sm'>
									<input type='checkbox' checked={isBandMember} onChange={(e) => setIsBandMember(e.target.checked)} />
									Band member
								</label>

								{/* Band fields */}
								{isBandMember && (
									<div className='flex flex-col gap-3 rounded-lg border border-white/10 p-3'>
										<input placeholder='Display name' value={displayName} onChange={(e) => setDisplayName(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none' />

										<input placeholder='Image URL' value={image} onChange={(e) => setImage(e.target.value)} className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none' />

										<textarea placeholder='Bio' value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className='rounded-md bg-white/10 p-3 text-sm outline-none resize-none' />
									</div>
								)}

								<input
									type='password'
									placeholder='Reset password (optional)'
									value={newPassword}
									disabled={saving}
									onChange={(e) => setNewPassword(e.target.value)}
									className='rounded-md bg-white/10 px-3 py-2 text-sm outline-none'
								/>

								<div className='flex justify-end gap-3 pt-2'>
									<button disabled={saving} onClick={() => setEditUser(null)} className='text-sm text-white/60 hover:text-white disabled:opacity-40'>
										Cancel
									</button>

									<button disabled={saving} onClick={saveUser} className='rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition disabled:opacity-40'>
										{saving ? 'Saving…' : 'Save'}
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Delete confirmation */}
			<AnimatePresence>
				{deleteUser && (
					<>
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => !deleting && setDeleteUser(null)} className='fixed inset-0 z-40 bg-black' />

						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className='fixed inset-0 z-50 flex items-center justify-center px-4'>
							<div className='w-full max-w-sm rounded-xl border border-white/10 bg-black/90 backdrop-blur p-6 flex flex-col gap-4'>
								<h3 className='text-lg font-semibold'>Delete user?</h3>

								<p className='text-sm text-white/60'>This action cannot be undone.</p>

								<div className='flex justify-end gap-3 pt-2'>
									<button disabled={deleting} onClick={() => setDeleteUser(null)} className='text-sm text-white/60 hover:text-white disabled:opacity-40'>
										Cancel
									</button>

									<button disabled={deleting} onClick={confirmDelete} className='rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 px-4 py-2 text-sm transition disabled:opacity-40'>
										{deleting ? 'Deleting…' : 'Delete'}
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
