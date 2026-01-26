/** @format */

import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongoose';

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'Band Login',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				await connectDB();

				// Explicitly select password
				const user = await User.findOne({
					email: credentials.email.toLowerCase(),
				}).select('+password');

				if (!user) {
					return null;
				}

				const valid = await user.comparePassword(credentials.password);

				if (!valid) {
					return null;
				}

				return {
					id: user._id.toString(),
					email: user.email,
					role: user.role,
					name: user.name,
				};
			},
		}),
	],

	session: {
		strategy: 'jwt',
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = (user as any).role;
			}
			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				(session.user as any).role = token.role;
			}
			return session;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
