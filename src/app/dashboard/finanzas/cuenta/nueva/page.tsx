'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import RequireRole from '@/components/RequireRole';

export default function NuevaCuentaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guias, setGuias] = useState<{ id: string; nombres: string; apellidos: string }[]>([]);
  const [formData, setFormData] = useState({
    descripcion: '',
    montoTotal: '',
    montoReunido: '0',
    estado: 'PENDIENTE',
    guiaMayorId: '',
  });

  useEffect(() => {
    fetch('/api/gui-mayor')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setGuias(Array.isArray(data) ? data : []))
      .catch(() => setGuias([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/finanzas/cuentas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la cuenta');
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
            <h1 className={styles.pageTitle}>Nueva Cuenta Pendiente</h1>
            <p className={styles.pageSubtitle}>Registro de una nueva cuenta por pagar</p>
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
            <label className="form-label" htmlFor="descripcion">Descripcion *</label>
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              className="form-input"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Descripcion de la cuenta"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="montoTotal">Monto Total (COP) *</label>
            <input
              id="montoTotal"
              name="montoTotal"
              type="number"
              className="form-input"
              value={formData.montoTotal}
              onChange={handleChange}
              required
              min="0"
              step="100"
              placeholder="Ingrese el monto total"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="montoReunido">Monto Reunido (COP)</label>
            <input
              id="montoReunido"
              name="montoReunido"
              type="number"
              className="form-input"
              value={formData.montoReunido}
              onChange={handleChange}
              min="0"
              step="100"
              placeholder="Monto recopilado hasta la fecha"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              className="form-input"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADA">Pagada</option>
              <option value="VENCIDA">Vencida</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="guiaMayorId">Guía Mayor (opcional)</label>
            <select
              id="guiaMayorId"
              name="guiaMayorId"
              className="form-input"
              value={formData.guiaMayorId}
              onChange={handleChange}
            >
              <option value="">Deuda del club (general)</option>
              {guias.map((gm) => (
                <option key={gm.id} value={gm.id}>
                  {gm.nombres} {gm.apellidos}
                </option>
              ))}
            </select>
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
              {loading ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </RequireRole>
  );
}
