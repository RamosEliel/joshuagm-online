import bcrypt from 'bcryptjs';
import prisma from './src/lib/prisma';

const users = [
  {
    email: 'admin@joshuagm.com',
    password: 'Admin123!',
    nombre: 'Administrador Principal',
    rol: 'ADMINISTRADOR' as const,
  },
  {
    email: 'tesorero@joshuagm.com',
    password: 'Tesorero123!',
    nombre: 'Tesorero del Club',
    rol: 'TESORERO' as const,
  },
  {
    email: 'gestor@joshuagm.com',
    password: 'Gestor123!',
    nombre: 'Gestor de Bienes',
    rol: 'GESTOR_BIENES' as const,
  },
  {
    email: 'gm@joshuagm.com',
    password: 'Gm123!',
    nombre: 'Guía Mayor',
    rol: 'GM' as const,
  },
];

async function seedUsers() {
  console.log('🌱 Iniciando seed de usuarios...\n');

  for (const user of users) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        console.log(`⚠️  Usuario ${user.email} ya existe, saltando...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 12);

      await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          nombre: user.nombre,
          rol: user.rol,
        },
      });

      console.log(`✅ Usuario creado:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Rol: ${user.rol}`);
      console.log(`   Contraseña: ${user.password}\n`);
    } catch (error) {
      console.error(`❌ Error creando usuario ${user.email}:`, error);
    }
  }

  console.log('🎉 Seed completado!');
  console.log('\n📋 Resumen de credenciales:');
  console.table(
    users.map((u) => ({
      Rol: u.rol,
      Email: u.email,
      Contraseña: u.password,
    }))
  );
}

seedUsers()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
