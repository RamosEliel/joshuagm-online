'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './Sidebar.module.css';
import { useState } from 'react';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    ]
  },
  {
    title: 'Gestión de Personas',
    items: [
      { name: 'Guías Mayores', href: '/dashboard/gui-mayor', icon: 'people' },
      { name: 'Finanzas GM', href: '/dashboard/finanzas/gm', icon: 'account' },
    ]
  },
  {
    title: 'Gestión de Recursos',
    items: [
      { name: 'Finanzas', href: '/dashboard/finanzas', icon: 'finance' },
      { name: 'Bienes', href: '/dashboard/bienes', icon: 'inventory' },
      { name: 'Uso en Campamentos', href: '/dashboard/bienes/uso-campamento', icon: 'camping' },
      { name: 'Actividades', href: '/dashboard/eventos', icon: 'event' },
    ]
  }
];

const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  camping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 20h18L12 4l-9 16z"/>
      <path d="M12 4v16"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Gestión de Personas', 'Gestión de Recursos']);
  const isAdmin = session?.user?.rol === 'ADMINISTRADOR';

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <svg className={styles.logo} viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
            <path d="M24 12L24 36M12 24L36 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <span className={styles.brandName}>Joshua GM</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <h3
              className={styles.navSectionTitle}
              onClick={() => toggleSection(section.title)}
            >
              <span className={styles.navTitle}>{section.title}</span>
              <svg
                className={`${styles.chevron} ${expandedSections.includes(section.title) ? styles.open : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </h3>
            <ul className={`${styles.navList} ${expandedSections.includes(section.title) ? styles.expanded : ''}`}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${pathname === item.href || pathname.startsWith(item.href + '/') ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>{icons[item.icon]}</span>
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {isAdmin && (
          <div className={styles.navSection}>
            <h3
              className={styles.navSectionTitle}
              onClick={() => toggleSection('Administración')}
            >
              <span className={styles.navTitle}>Administración</span>
              <svg
                className={`${styles.chevron} ${expandedSections.includes('Administración') ? styles.open : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </h3>
            <ul className={`${styles.navList} ${expandedSections.includes('Administración') ? styles.expanded : ''}`}>
              <li>
                <Link
                  href="/dashboard/administracion/usuarios"
                  className={`${styles.navLink} ${pathname === '/dashboard/administracion/usuarios' || pathname.startsWith('/dashboard/administracion/usuarios/') ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>{icons.admin}</span>
                  <span className={styles.navText}>Usuarios</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={styles.logoutBtn}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
