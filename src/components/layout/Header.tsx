'use client';

import { useSession } from 'next-auth/react';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();

  const getRoleLabel = (rol: string) => {
    const roles: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      TESORERO: 'Tesorero',
      GESTOR_BIENES: 'Gestor de Bienes',
      GM: 'Guía Mayor',
    };
    return roles[rol] || rol;
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>Panel de Control</h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {session?.user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{session?.user?.nombre || 'Usuario'}</span>
            <span className={styles.userRole}>{getRoleLabel(session?.user?.rol || 'GM')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
