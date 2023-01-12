import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db/client';
import Stripe from 'stripe';

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  // Include user.id on session and user subsription on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.subscription = user.subscription;
        session.user.stripe_customer = user.stripe_customer;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    createUser: async ({ user }) => {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
      });

      if (user.email) {
        const customer = await stripe.customers.create({
          email: user.email,
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripe_customer: customer.id,
          },
        });
        // await prisma.assessment.create({
        //   data: {
        //     userId: user.id,
        //     assessmentName: 'Assessment 1',
        //     chatLog: '[{"user":"AI","message":"Hi, how can I help you?"}]',
        //   },
        // });
        await prisma.postCounter.create({
          data: {
            userId: user.id,
            counter: 0,
          },
        });
      }
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),

    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
