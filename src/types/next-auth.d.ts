import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      stripe_customer: string;
      subscription: string;
      id: string;
    } & DefaultSession['user'];
  }
}
