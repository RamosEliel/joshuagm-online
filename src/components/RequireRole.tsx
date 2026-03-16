'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type RequireRoleProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const router = useRouter();
  const { status, data } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    const role = data?.user?.rol;
    if (status === 'authenticated' && role && !allowedRoles.includes(role)) {
      router.replace('/dashboard');
    }
  }, [allowedRoles, data?.user?.rol, router, status]);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return null;

  const role = data?.user?.rol;
  if (role && !allowedRoles.includes(role)) return null;

  return children;
}

