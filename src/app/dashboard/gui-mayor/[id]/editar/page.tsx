'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './editar.module.css';
import RequireRole from '@/components/RequireRole';

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
}

export default function EditarGuiaMayorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    tipoSangre: '',
    cargo: '',
    telefono: '',
    edad: '',
    participacionesCampamento: '0',
    estado: 'ACTIVO',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/gui-mayor/${id}`);
        if (!response.ok) throw new Error('Error al cargar');
        const data: GuiaMayor = await response.json();

        setFormData({
          nombres: data.nombres,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento.split('T')[0],
          tipoSangre: data.tipoSangre || '',
          cargo: data.cargo,
          telefono: data.telefono,
          edad: data.edad.toString(),
          participacionesCampamento: data.participacionesCampamento.toString(),
          estado: data.estado,
        });
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch(`/api/gui-mayor/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el guia mayor');
      }

      router.push(`/dashboard/gui-mayor/${id}`);
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
    <RequireRole allowedRoles={['ADMINISTRADOR', 'TESORERO']}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Editar Guia Mayor</h1>
            <p className={styles.pageSubtitle}>Actualizacion de informacion del guia mayor</p>
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
              <label className="form-label" htmlFor="nombres">Nombres *</label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                className="form-input"
                value={formData.nombres}
                onChange={handleChange}
                required
                placeholder="Ingrese los nombres"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellidos">Apellidos *</label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                className="form-input"
                value={formData.apellidos}
                onChange={handleChange}
                required
                placeholder="Ingrese los apellidos"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                className="form-input"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edad">Edad *</label>
              <input
                id="edad"
                name="edad"
                type="number"
                className="form-input"
                value={formData.edad}
                onChange={handleChange}
                required
                min="1"
                max="100"
                placeholder="Ingrese la edad"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tipoSangre">Tipo de Sangre</label>
              <select
                id="tipoSangre"
                name="tipoSangre"
                className="form-input"
                value={formData.tipoSangre}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="A_POSITIVO">A+</option>
                <option value="A_NEGATIVO">A-</option>
                <option value="B_POSITIVO">B+</option>
                <option value="B_NEGATIVO">B-</option>
                <option value="AB_POSITIVO">AB+</option>
                <option value="AB_NEGATIVO">AB-</option>
                <option value="O_POSITIVO">O+</option>
                <option value="O_NEGATIVO">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="telefono">Telefono *</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="form-input"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ingrese el telefono"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cargo">Cargo en el Club *</label>
              <input
                id="cargo"
                name="cargo"
                type="text"
                className="form-input"
                value={formData.cargo}
                onChange={handleChange}
                required
                placeholder="Ingrese el cargo"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="participacionesCampamento">Participaciones en Campamento</label>
              <input
                id="participacionesCampamento"
                name="participacionesCampamento"
                type="number"
                className="form-input"
                value={formData.participacionesCampamento}
                onChange={handleChange}
                min="0"
                placeholder="Numero de campanentos"
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
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </div>
          </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push('/dashboard/gui-mayor')}
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
