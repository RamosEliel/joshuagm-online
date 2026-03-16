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

    // Validar que el ID no esté vacío
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const guiaMayor = await prisma.guiaMayor.findUnique({
      where: { id },
      include: {
        finanzas: true,
        actividades: {
          include: {
            actividad: true,
          },
        },
      },
    });

    if (!guiaMayor) {
      return NextResponse.json(
        { error: 'Guía mayor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(guiaMayor);
  } catch (error) {
    console.error('Error fetching guia mayor:', error);
    return NextResponse.json(
      { error: 'Error al obtener el guía mayor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que el ID no esté vacío
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Solo ADMINISTRADOR y TESORERO pueden editar
    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar datos obligatorios
    if (!data.nombres || !data.apellidos || !data.fechaNacimiento) {
      return NextResponse.json(
        { error: 'Nombres, apellidos y fecha de nacimiento son obligatorios' },
        { status: 400 }
      );
    }

    const guiaMayor = await prisma.guiaMayor.update({
      where: { id },
      data: {
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        fechaNacimiento: new Date(data.fechaNacimiento),
        tipoSangre: data.tipoSangre || null,
        cargo: data.cargo?.trim() || '',
        telefono: data.telefono?.trim() || '',
        edad: parseInt(data.edad, 10),
        participacionesCampamento: parseInt(data.participacionesCampamento, 10) || 0,
        estado: data.estado || 'ACTIVO',
      },
    });

    return NextResponse.json(guiaMayor);
  } catch (error) {
    console.error('Error updating guia mayor:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el guía mayor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que el ID no esté vacío
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Solo ADMINISTRADOR puede eliminar
    if (!session || !['ADMINISTRADOR'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado. Solo el administrador puede eliminar guías mayores' },
        { status: 401 }
      );
    }

    await prisma.guiaMayor.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Guía mayor eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting guia mayor:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el guía mayor' },
      { status: 500 }
    );
  }
}
