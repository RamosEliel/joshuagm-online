'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import RequireRole from '@/components/RequireRole';

const CATEGORIAS_BIENES = [
  { value: 'ARTICULOS_ACAMPAR', label: 'Artículos de Acampar' },
  { value: 'EQUIPO_COCINA', label: 'Equipo de Cocina' },
  { value: 'HERRAMIENTAS', label: 'Herramientas' },
  { value: 'MATERIAL_DEPORTIVO', label: 'Material Deportivo' },
  { value: 'UTILES_ESCOLARES', label: 'Útiles Escolares' },
  { value: 'EQUIPO_PRIMEROS_AUXILIOS', label: 'Equipo de Primeros Auxilios' },
  { value: 'OTROS', label: 'Otros' },
];

const TIPOS_BIENES = [
  'Carpa',
  'Sleeping Bag',
  'Mochila',
  'Linterna',
  'Cantimplora',
  'Olla',
  'Sartén',
  'Utensilios',
  'Estufa',
  'Hacha',
  'Pala',
  'Martillo',
  'Cuerda',
  'Balón',
  'Red',
  'Libro',
  'Cuaderno',
  'Lápices',
  'Botiquín',
  'Vendas',
  'Antiséptico',
  'Otro',
];

export default function NuevoBienPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    tipo: '',
    cantidad: '1',
    imagenUrl: '',
    descripcion: '',
  });

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

    try {
      const response = await fetch('/api/bienes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el bien');
      }

      router.push('/dashboard/bienes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireRole allowedRoles={['ADMINISTRADOR', 'GESTOR_BIENES']}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Nuevo Bien</h1>
            <p className={styles.pageSubtitle}>Registro de un nuevo bien en el inventario</p>
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
                <label className="form-label" htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  className="form-input"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una categoría...</option>
                  {CATEGORIAS_BIENES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tipo">Tipo Específico *</label>
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
              <label className="form-label" htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-input"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Descripción opcional del bien"
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
                {loading ? 'Guardando...' : 'Guardar Bien'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
