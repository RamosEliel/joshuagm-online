'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import RequireRole from '@/components/RequireRole';

const TIPOS_BIENES = [
  'Arte de Acampar',
  'Cocina',
  'Herramientas',
  'Primeros Auxilios',
  'Transporte',
  'Comunicacion',
  'Otro',
];

interface Bien {
  id: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  imagenUrl: string | null;
  descripcion: string | null;
}

export default function EditarBienPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    cantidad: '1',
    imagenUrl: '',
    descripcion: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/bienes/${id}`);
        if (!response.ok) throw new Error('Error al cargar');
        const data: Bien = await response.json();

        setFormData({
          nombre: data.nombre,
          tipo: data.tipo,
          cantidad: data.cantidad.toString(),
          imagenUrl: data.imagenUrl || '',
          descripcion: data.descripcion || '',
        });
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { id } = await params;

    try {
      const response = await fetch(`/api/bienes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el bien');
      }

      router.push('/dashboard/bienes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <RequireRole allowedRoles={['ADMINISTRADOR', 'GESTOR_BIENES']}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Editar Bien</h1>
            <p className={styles.pageSubtitle}>Actualizacion de informacion del bien</p>
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
              <label className="form-label" htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre del bien"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tipo">Tipo de Bien *</label>
              <select
                id="tipo"
                name="tipo"
                className="form-input"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un tipo...</option>
                {TIPOS_BIENES.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cantidad">Cantidad *</label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                className="form-input"
                value={formData.cantidad}
                onChange={handleChange}
                required
                min="0"
                placeholder="Cantidad disponible"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="imagenUrl">URL de Imagen *</label>
              <input
                id="imagenUrl"
                name="imagenUrl"
                type="url"
                className="form-input"
                value={formData.imagenUrl}
                onChange={handleChange}
                required
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripcion *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="form-input"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              required
              placeholder="Descripcion del bien"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/dashboard/bienes')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
