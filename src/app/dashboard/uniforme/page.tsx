'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface UniformItem {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagenUrl: string;
  adquirido: boolean;
}

export default function UniformePage() {
  const [items, setItems] = useState<UniformItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/uniforme');
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setItems(data);
    } catch {
      setError('No se pudo cargar el uniforme.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleItem = async (item: UniformItem) => {
    const res = await fetch('/api/uniforme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, adquirido: !item.adquirido }),
    });
    if (!res.ok) {
      setError('No se pudo actualizar el item');
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, adquirido: !i.adquirido } : i))
    );
  };

  if (loading) {
    return <div className={styles.loading}>Cargando uniforme...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Uniforme de Gala - Guía Mayor</h1>
          <p className={styles.pageSubtitle}>Marca lo que ya tienes adquirido</p>
        </div>
        <button className="btn btn-outline" onClick={fetchItems}>Actualizar</button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageWrap}>
              <img src={item.imagenUrl} alt={item.nombre} />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.itemName}>{item.nombre}</h3>
              {item.descripcion && <p className={styles.itemDesc}>{item.descripcion}</p>}
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={item.adquirido}
                  onChange={() => toggleItem(item)}
                />
                <span>{item.adquirido ? 'Adquirido' : 'Pendiente'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
