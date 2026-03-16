import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (process.env.ALLOW_PROD_SETUP !== 'true') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const totalUsers = await prisma.user.count();
      if (totalUsers > 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const setupToken = process.env.SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json(
        { error: 'SETUP_TOKEN no configurado' },
        { status: 500 }
      );
    }

    // Accept token via header to avoid leaking in URLs.
    const headerToken =
      request.headers.get('x-setup-token') ||
      request.headers.get('X-Setup-Token') ||
      (request.headers.get('authorization')?.replace(/^Bearer\\s+/i, '') ?? null);

    if (!headerToken || headerToken !== setupToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@joshuagm.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD no configurado' },
        { status: 500 }
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'El usuario administrador ya existe' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nombre: 'Administrador',
        rol: 'ADMINISTRADOR',
      },
    });

    return NextResponse.json({
      message: 'Usuario administrador creado',
      email: admin.email,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Error al crear el usuario administrador' },
      { status: 500 }
    );
  }
}
