'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './uso-campamento.module.css';

interface Bien {
  id: string;
  nombre: string;
  categoria: string;
}

interface GuiaMayor {
  id: string;
  nombres: string;
  apellidos: string;
}

interface UsoBien {
  id: string;
  bien: Bien;
  guiaMayor: GuiaMayor;
  campamentoNum: number;
  fechaUso: string;
  cantidadUsada: number;
  observaciones: string | null;
}

export default function UsoCampamentoPage() {
  const [usos, setUsos] = useState<UsoBien[]>([]);
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [guias, setGuias] = useState<GuiaMayor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroCampamento, setFiltroCampamento] = useState('');
  const [filtroGM, setFiltroGM] = useState('');

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bienId: '',
    guiaMayorId: '',
    campamentoNum: '',
    cantidadUsada: '1',
    observaciones: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usosRes, bienesRes, guiasRes] = await Promise.all([
        fetch('/api/bienes/uso-campamento'),
        fetch('/api/bienes'),
        fetch('/api/gui-mayor'),
      ]);

      if (!usosRes.ok || !bienesRes.ok || !guiasRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const [usosData, bienesData, guiasData] = await Promise.all([
        usosRes.json(),
        bienesRes.json(),
        guiasRes.json(),
      ]);

      setUsos(usosData);
      setBienes(bienesData);
      setGuias(guiasData);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/bienes/uso-campamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar');
      }

      setFormData({
        bienId: '',
        guiaMayorId: '',
        campamentoNum: '',
        cantidadUsada: '1',
        observaciones: '',
      });
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const usosFiltrados = usos.filter((uso) => {
    const matchCampamento = filtroCampamento
      ? uso.campamentoNum === parseInt(filtroCampamento)
      : true;
    const matchGM = filtroGM
      ? uso.guiaMayor.id === filtroGM
      : true;
    return matchCampamento && matchGM;
  });

  const getCategoriaLabel = (cat: string) => {
    const labels: Record<string, string> = {
      ARTICULOS_ACAMPAR: 'Artículos de Acampar',
      EQUIPO_COCINA: 'Equipo de Cocina',
      HERRAMIENTAS: 'Herramientas',
      MATERIAL_DEPORTIVO: 'Material Deportivo',
      UTILES_ESCOLARES: 'Útiles Escolares',
      EQUIPO_PRIMEROS_AUXILIOS: 'Equipo de Primeros Auxilios',
      OTROS: 'Otros',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Uso de Bienes en Campamentos</h1>
          <p className={styles.pageSubtitle}>
            Registro de bienes utilizados por GM en cada campamento
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Registrar Uso
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')} className={styles.closeError}>×</button>
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Registrar Uso de Bien</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bien *</label>
                <select
                  className={styles.select}
                  value={formData.bienId}
                  onChange={(e) => setFormData({ ...formData, bienId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar bien</option>
                  {bienes.map((bien) => (
                    <option key={bien.id} value={bien.id}>
                      {bien.nombre} ({getCategoriaLabel(bien.categoria)})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Guía Mayor *</label>
                <select
                  className={styles.select}
                  value={formData.guiaMayorId}
                  onChange={(e) => setFormData({ ...formData, guiaMayorId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar GM</option>
                  {guias.map((gm) => (
                    <option key={gm.id} value={gm.id}>
                      {gm.nombres} {gm.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>N° Campamento *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.campamentoNum}
                  onChange={(e) => setFormData({ ...formData, campamentoNum: e.target.value })}
                  min="1"
                  required
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cantidad Usada</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.cantidadUsada}
                  onChange={(e) => setFormData({ ...formData, cantidadUsada: e.target.value })}
                  min="1"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Observaciones</label>
                <textarea
                  className={styles.textarea}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Estado del bien, daños, etc."
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filtrar por Campamento:</label>
          <select
            className={styles.filterSelect}
            value={filtroCampamento}
            onChange={(e) => setFiltroCampamento(e.target.value)}
          >
            <option value="">Todos</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>Campamento #{num}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filtrar por GM:</label>
          <select
            className={styles.filterSelect}
            value={filtroGM}
            onChange={(e) => setFiltroGM(e.target.value)}
          >
            <option value="">Todos</option>
            {guias.map((gm) => (
              <option key={gm.id} value={gm.id}>
                {gm.nombres} {gm.apellidos}
              </option>
            ))}
          </select>
        </div>
      </div>

      {usosFiltrados.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No hay registros</h3>
          <p className={styles.emptyText}>
            No se han registrado usos de bienes en campamentos con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campamento</th>
                <th>Guía Mayor</th>
                <th>Bien</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {usosFiltrados.map((uso) => (
                <tr key={uso.id}>
                  <td>
                    <span className={styles.campamentoBadge}>
                      #{uso.campamentoNum}
                    </span>
                  </td>
                  <td>{uso.guiaMayor.nombres} {uso.guiaMayor.apellidos}</td>
                  <td>{uso.bien.nombre}</td>
                  <td>
                    <span className={styles.categoriaBadge}>
                      {getCategoriaLabel(uso.bien.categoria)}
                    </span>
                  </td>
                  <td>{uso.cantidadUsada}</td>
                  <td>{new Date(uso.fechaUso).toLocaleDateString('es-CO')}</td>
                  <td>{uso.observaciones || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.summary}>
        <h3 className={styles.summaryTitle}>Resumen por Categoría</h3>
        <div className={styles.summaryGrid}>
          {Object.entries(
            usosFiltrados.reduce((acc, uso) => {
              const cat = uso.bien.categoria;
              acc[cat] = (acc[cat] || 0) + uso.cantidadUsada;
              return acc;
            }, {} as Record<string, number>)
          ).map(([categoria, total]) => (
            <div key={categoria} className={styles.summaryCard}>
              <span className={styles.summaryLabel}>{getCategoriaLabel(categoria)}</span>
              <span className={styles.summaryValue}>{total} usos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
