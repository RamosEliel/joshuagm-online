'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './detalle.module.css';

interface GuiaMayor {
  id: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  tipoSangre: string | null;
  cargo: string;
  telefono: string;
  edad: number;
  participacionesCampamento: number;
  estado: string;
  createdAt: string;
}

export default function DetalleGuiaMayorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [guiaMayor, setGuiaMayor] = useState<GuiaMayor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/gui-mayor/${id}`);
        if (!response.ok) throw new Error('Error al cargar');
        const data = await response.json();
        setGuiaMayor(data);
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (!confirm('Esta seguro de eliminar este guia mayor?')) return;

    const { id } = await params;
    try {
      const response = await fetch(`/api/gui-mayor/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      router.push('/dashboard/gui-mayor');
    } catch {
      alert('Error al eliminar el guia mayor');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error || !guiaMayor) {
    return (
      <div className={styles.error}>
        <p>{error || 'Guia mayor no encontrado'}</p>
        <Link href="/dashboard/gui-mayor" className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      ACTIVO: 'badge-success',
      INACTIVO: 'badge-warning',
      SUSPENDIDO: 'badge-error',
    };
    return badges[estado] || 'badge-info';
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      ACTIVO: 'Activo',
      INACTIVO: 'Inactivo',
      SUSPENDIDO: 'Suspendido',
    };
    return labels[estado] || estado;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/gui-mayor" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver a Guias Mayores
          </Link>
          <h1 className={styles.pageTitle}>
            {guiaMayor.nombres} {guiaMayor.apellidos}
          </h1>
          <span className={`badge ${getEstadoBadge(guiaMayor.estado)}`}>
            {getEstadoLabel(guiaMayor.estado)}
          </span>
        </div>
        <div className={styles.headerActions}>
          {session?.user?.rol && ['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol) && (
            <Link href={`/dashboard/gui-mayor/${guiaMayor.id}/editar`} className="btn btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </Link>
          )}
          {session?.user?.rol === 'ADMINISTRADOR' && (
            <button onClick={handleDelete} className="btn btn-ghost" style={{ color: 'var(--color-error)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Informacion Personal</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nombres</span>
              <span className={styles.infoValue}>{guiaMayor.nombres}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Apellidos</span>
              <span className={styles.infoValue}>{guiaMayor.apellidos}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha de Nacimiento</span>
              <span className={styles.infoValue}>{formatDate(guiaMayor.fechaNacimiento)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Edad</span>
              <span className={styles.infoValue}>{guiaMayor.edad} años</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo de Sangre</span>
              <span className={styles.infoValue}>{guiaMayor.tipoSangre || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Informacion de Contacto</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Telefono</span>
              <span className={styles.infoValue}>{guiaMayor.telefono}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cargo en el Club</span>
              <span className={styles.infoValue}>{guiaMayor.cargo}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Informacion Adicional</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Participaciones en Campamento</span>
              <span className={styles.infoValue}>{guiaMayor.participacionesCampamento}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha de Registro</span>
              <span className={styles.infoValue}>{formatDate(guiaMayor.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
