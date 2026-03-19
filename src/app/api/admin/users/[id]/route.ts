import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const ADMIN_ROLE = 'ADMINISTRADOR';

function isAdmin(role?: string) {
  return role === ADMIN_ROLE;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user?.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      );
    }

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, rol: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.rol === ADMIN_ROLE) {
      const adminCount = await prisma.user.count({
        where: { rol: ADMIN_ROLE },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Debe existir al menos un administrador' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
