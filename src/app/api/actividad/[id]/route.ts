import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const actividad = await prisma.actividad.findUnique({
      where: { id },
      include: {
        guiasMayores: {
          include: {
            guiaMayor: true,
          },
        },
      },
    });

    if (!actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(actividad);
  } catch (error) {
    console.error('Error fetching actividad:', error);
    return NextResponse.json(
      { error: 'Error al obtener la actividad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    const actividad = await prisma.actividad.update({
      where: { id },
      data: {
        tipo: data.tipo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        guiasMayores: {
          deleteMany: {},
          create: data.guiasMayores?.map((gmId: string) => ({
            guiaMayorId: gmId,
          })) || [],
        },
      },
    });

    return NextResponse.json(actividad);
  } catch (error) {
    console.error('Error updating actividad:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la actividad' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.actividad.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting actividad:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la actividad' },
      { status: 500 }
    );
  }
}
