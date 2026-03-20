'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './eventos.module.css';

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

export default function EventosPage() {
  const { data: session } = useSession();
  const canCreate = session?.user?.rol && ['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/actividad');
        if (!response.ok) throw new Error('Error al cargar');
        const data = await response.json();
        setActividades(data);
      } catch {
        setError('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calcularTiempoRestante = (fechaInicio: string) => {
    const inicio = new Date(fechaInicio);
    const ahora = new Date();
    const diff = inicio.getTime() - ahora.getTime();

    if (diff <= 0) return 'Ya comenzó';

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `En ${dias}d ${horas}h`;
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'EVENTO' ? 'badge-warning' : 'badge-info';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No se pudo cargar</h3>
          <p className={styles.emptyText}>{error}</p>
          <Link href="/dashboard" className="btn btn-primary">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Eventos y Actividades</h1>
          <p className={styles.pageSubtitle}>Gestión de compromisos del club</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/eventos/nuevo" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Evento
          </Link>
        )}
      </div>

      {actividades.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No hay eventos registrados</h3>
          <p className={styles.emptyText}>Comienza creando el primer evento o actividad</p>
          {canCreate && (
            <Link href="/dashboard/eventos/nuevo" className="btn btn-primary">
              Crear Evento
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.actividadesGrid}>
          {actividades.map((actividad) => (
            <div key={actividad.id} className={styles.actividadCard}>
              <div className={styles.actividadHeader}>
                <span className={`badge ${getTipoBadge(actividad.tipo)}`}>
                  {actividad.tipo === 'EVENTO' ? 'Evento' : 'Actividad'}
                </span>
                <span className={styles.fechaBadge}>
                  {calcularTiempoRestante(actividad.fechaInicio)}
                </span>
              </div>
              <h3 className={styles.actividadNombre}>{actividad.nombre}</h3>
              {actividad.descripcion && (
                <p className={styles.actividadDesc}>{actividad.descripcion}</p>
              )}
              <div className={styles.actividadMeta}>
                <div className={styles.fechaInfo}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>
                    {new Date(actividad.fechaInicio).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {actividad.fechaFin && (
                  <div className={styles.fechaInfo}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>
                      Fin: {new Date(actividad.fechaFin).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.guiasList}>
                <span className={styles.guiasLabel}>Guías participantes:</span>
                <div className={styles.guias}>
                  {actividad.guiasMayores.slice(0, 3).map((gm) => (
                    <span key={gm.guiaMayor.id} className={styles.gmBadge}>
                      {gm.guiaMayor.nombres} {gm.guiaMayor.apellidos}
                    </span>
                  ))}
                  {actividad.guiasMayores.length > 3 && (
                    <span className={styles.gmBadge}>
                      +{actividad.guiasMayores.length - 3} más
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.actividadActions}>
                <Link href={`/dashboard/eventos/${actividad.id}`} className={styles.viewBtn}>
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
