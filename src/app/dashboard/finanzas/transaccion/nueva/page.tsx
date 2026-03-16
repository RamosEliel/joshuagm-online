'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import RequireRole from '@/components/RequireRole';

export default function NuevaTransaccionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'INGRESO',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
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
      const response = await fetch('/api/finanzas/transacciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la transaccion');
      }

      router.push('/dashboard/finanzas');
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
            <h1 className={styles.pageTitle}>Nueva Transaccion</h1>
            <p className={styles.pageSubtitle}>Registro de ingreso o gasto</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

          <div className="form-group">
            <label className="form-label" htmlFor="tipo">Tipo de Transaccion *</label>
            <select
              id="tipo"
              name="tipo"
              className="form-input"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="INGRESO">Ingreso</option>
              <option value="GASTO">Gasto</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripcion *</label>
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              className="form-input"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Descripcion de la transaccion"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="monto">Monto (COP) *</label>
            <input
              id="monto"
              name="monto"
              type="number"
              className="form-input"
              value={formData.monto}
              onChange={handleChange}
              required
              min="0"
              step="100"
              placeholder="Ingrese el monto"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fecha">Fecha *</label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              className="form-input"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push('/dashboard/finanzas')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Transaccion'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
