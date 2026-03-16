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
}

interface Actividad {
  id: string;
  tipo: 'EVENTO' | 'ACTIVIDAD';
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  guiasMayores: {
    guiaMayor: GuiaMayor;
  }[];
  createdAt: string;
}

export default function DetalleEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/actividad/${id}`);
        if (!response.ok) throw new Error('Error al cargar');
        const data = await response.json();
        setActividad(data);
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar este evento?')) return;

    const { id } = await params;
    try {
      const response = await fetch(`/api/actividad/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      router.push('/dashboard/eventos');
    } catch {
      alert('Error al eliminar el evento');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error || !actividad) {
    return (
      <div className={styles.error}>
        <p>{error || 'Evento no encontrado'}</p>
        <Link href="/dashboard/eventos" className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  const getTipoBadge = (tipo: string) => {
    return tipo === 'EVENTO' ? 'badge-warning' : 'badge-info';
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/eventos" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver a Eventos
          </Link>
          <h1 className={styles.pageTitle}>{actividad.nombre}</h1>
          <span className={`badge ${getTipoBadge(actividad.tipo)}`}>
            {actividad.tipo === 'EVENTO' ? 'Evento' : 'Actividad'}
          </span>
        </div>
        <div className={styles.headerActions}>
          {session?.user?.rol && ['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol) && (
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
          <h3 className={styles.cardTitle}>Información del Evento</h3>
          <div className={styles.infoList}>
            {actividad.descripcion && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Descripción</span>
                <span className={styles.infoValue}>{actividad.descripcion}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha de Inicio</span>
              <span className={styles.infoValue}>{formatDate(actividad.fechaInicio)}</span>
            </div>
            {actividad.fechaFin && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fecha de Fin</span>
                <span className={styles.infoValue}>{formatDate(actividad.fechaFin)}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Guías Participantes</span>
              <span className={styles.infoValue}>{actividad.guiasMayores.length}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Guías Mayores Participantes</h3>
          <div className={styles.guiasList}>
            {actividad.guiasMayores.length === 0 ? (
              <p className={styles.emptyText}>No hay guías participantes registrados</p>
            ) : (
              actividad.guiasMayores.map((gm) => (
                <div key={gm.guiaMayor.id} className={styles.gmItem}>
                  <div className={styles.gmAvatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className={styles.gmInfo}>
                    <span className={styles.gmNombre}>
                      {gm.guiaMayor.nombres} {gm.guiaMayor.apellidos}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
