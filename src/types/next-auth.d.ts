import 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User extends PrismaUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string | null;
  }
}