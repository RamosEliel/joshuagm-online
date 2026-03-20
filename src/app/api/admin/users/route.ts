import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Rol } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const ADMIN_ROLE = 'ADMINISTRADOR';

function isAdmin(role?: string) {
  return role === ADMIN_ROLE;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user?.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user?.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const email = String(data.email || '').trim().toLowerCase();
    const nombre = String(data.nombre || '').trim();
    const password = String(data.password || '');
    const rolInput = String(data.rol || '').trim();
    const guiaMayorId = data.guiaMayorId ? String(data.guiaMayorId).trim() : null;
    const validRoles = Object.values(Rol);
    const rol = validRoles.includes(rolInput as Rol) ? (rolInput as Rol) : null;

    if (!email || !password || !nombre || !rol) {
      return NextResponse.json(
        { error: 'Datos incompletos o rol invalido' },
        { status: 400 }
      );
    }

    if (rol === Rol.GM && !guiaMayorId) {
      return NextResponse.json(
        { error: 'Para rol GM debes asignar un Guía Mayor' },
        { status: 400 }
      );
    }

    if (guiaMayorId) {
      const gmExists = await prisma.guiaMayor.findUnique({
        where: { id: guiaMayorId },
        select: { id: true },
      });
      if (!gmExists) {
        return NextResponse.json(
          { error: 'El Guía Mayor seleccionado no existe' },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'El email ya existe' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        nombre,
        password: hashedPassword,
        rol,
        guiaMayorId,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
