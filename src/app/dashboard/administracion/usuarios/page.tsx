'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import RequireRole from '@/components/RequireRole';
import styles from './page.module.css';

const ROLES = [
  'ADMINISTRADOR',
  'TESORERO',
  'GESTOR_BIENES',
  'GM',
] as const;

type UserItem = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  createdAt: string;
};

export default function AdminUsuariosPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'GM',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo cargar usuarios');
      }
      const data = await res.json();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear el usuario');
      }

      setUsers((prev) => [data, ...prev]);
      setForm({ email: '', nombre: '', password: '', rol: 'GM' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('¿Seguro que deseas eliminar este usuario?');
    if (!ok) return;

    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar el usuario');
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  };

  return (
    <RequireRole allowedRoles={['ADMINISTRADOR']}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Administracion de Usuarios</h1>
            <p className={styles.pageSubtitle}>Crea, asigna roles y elimina cuentas</p>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={`card ${styles.formCard}`}>
            <h2 className={styles.sectionTitle}>Crear usuario</h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  className="form-input"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="correo@dominio.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña segura"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rol">Rol</label>
                <select
                  id="rol"
                  name="rol"
                  className="form-input"
                  value={form.rol}
                  onChange={handleChange}
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          </section>

          <section className={`card ${styles.tableCard}`}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>Usuarios existentes</h2>
              <button className="btn btn-outline" onClick={loadUsers}>
                Actualizar
              </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {loading ? (
              <p className={styles.loading}>Cargando usuarios...</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${styles.roleBadge}`}>
                            {user.rol}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(user.id)}
                            disabled={session?.user?.id === user.id}
                            title={
                              session?.user?.id === user.id
                                ? 'No puedes eliminar tu propia cuenta'
                                : 'Eliminar usuario'
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </RequireRole>
  );
}
