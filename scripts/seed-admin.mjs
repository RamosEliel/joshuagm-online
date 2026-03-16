// Script to seed the admin user directly into the database
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set in .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    // Check if admin already exists
    const existing = await pool.query(
      "SELECT id, email FROM \"User\" WHERE email = $1",
      ['admin@joshuagm.com']
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  El usuario admin ya existe:', existing.rows[0].email);
      await pool.end();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('0000', 12);

    // Generate a cuid-like id
    const id = 'clad' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO "User" (id, email, password, nombre, rol, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, nombre, rol`,
      [id, 'admin@joshuagm.com', hashedPassword, 'Administrador', 'ADMINISTRADOR']
    );

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   Email:', result.rows[0].email);
    console.log('   Nombre:', result.rows[0].nombre);
    console.log('   Rol:', result.rows[0].rol);
    console.log('   Password: 0000');
  } catch (error) {
    console.error('❌ Error al crear el admin:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
