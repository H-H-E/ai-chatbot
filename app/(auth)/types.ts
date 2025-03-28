import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    password: string | null;
    role: 'user' | 'admin';
    tokenLimit: number | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: 'user' | 'admin';
      tokenLimit?: number;
    };
  }
}
