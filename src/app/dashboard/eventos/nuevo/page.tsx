'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './nuevo.module.css';
import RequireRole from '@/components/RequireRole';

interface GuiaMayor {
  id: string;
  nombres: string;
  apellidos: string;
}

export default function NuevoEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guiasMayores, setGuiasMayores] = useState<GuiaMayor[]>([]);
  const [selectedGuias, setSelectedGuias] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'EVENTO',
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
  });

  useEffect(() => {
    const fetchGuias = async () => {
      try {
        const response = await fetch('/api/gui-mayor');
        if (!response.ok) throw new Error('Error al cargar guías');
        const data = await response.json();
        setGuiasMayores(data);
      } catch {
        setError('Error al cargar los guías mayores');
      }
    };
    fetchGuias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleGuia = (guiaId: string) => {
    setSelectedGuias(prev =>
      prev.includes(guiaId)
        ? prev.filter(id => id !== guiaId)
        : [...prev, guiaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/actividad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          guiasMayores: selectedGuias,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el evento');
      }

      router.push('/dashboard/eventos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireRole allowedRoles={['ADMINISTRADOR', 'TESORERO']}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Nuevo Evento o Actividad</h1>
            <p className={styles.pageSubtitle}>Registro de un nuevo compromiso para el club</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label" htmlFor="tipo">Tipo de Compromiso *</label>
              <select
                id="tipo"
                name="tipo"
                className="form-input"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="EVENTO">Evento</option>
                <option value="ACTIVIDAD">Actividad</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre del evento o actividad"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-input"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Descripción opcional del evento o actividad"
              />
            </div>

            <div className={styles.dateGrid}>
              <div className="form-group">
                <label className="form-label" htmlFor="fechaInicio">Fecha de Inicio *</label>
                <input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="datetime-local"
                  className="form-input"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fechaFin">Fecha de Fin</label>
                <input
                  id="fechaFin"
                  name="fechaFin"
                  type="datetime-local"
                  className="form-input"
                  value={formData.fechaFin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.guiasSection}>
            <h3 className={styles.sectionTitle}>Seleccionar Guías Mayores</h3>
            <div className={styles.guiasGrid}>
              {guiasMayores.map((gm) => (
                <label
                  key={gm.id}
                  className={`${styles.gmCheckbox} ${selectedGuias.includes(gm.id) ? styles.selected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGuias.includes(gm.id)}
                    onChange={() => toggleGuia(gm.id)}
                  />
                  <span>{gm.nombres} {gm.apellidos}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/dashboard/eventos')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
