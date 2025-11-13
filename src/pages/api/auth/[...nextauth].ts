// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from 'next-auth/adapters';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // Use the Prisma adapter to connect NextAuth to your database
  adapter: PrismaAdapter(prisma) as Adapter,
  
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // The profile function is only needed if you want to add custom fields to the User model from the provider
      // The default fields (name, email, image) are handled automatically.
    }),
    // ...add more providers here
  ],

  // Callbacks are used to control what happens when an action is performed.
  callbacks: {
    // The session callback is called whenever a session is checked.
    // We're adding the user's ID to the session object so it's available on the client.
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // Add id from the user object (from the database) to the session
      }
      return session;
    },
  },

  // Configure custom pages if you have them
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error', // A page to handle authentication errors
  },

  // A secret is required for production environments and for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);