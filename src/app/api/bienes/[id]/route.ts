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

    const bien = await prisma.bien.findUnique({
      where: { id },
    });

    if (!bien) {
      return NextResponse.json(
        { error: 'Bien no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(bien);
  } catch (error) {
    console.error('Error fetching bien:', error);
    return NextResponse.json(
      { error: 'Error al obtener el bien' },
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

    // Solo ADMINISTRADOR y GESTOR_BIENES pueden editar
    if (!session || !['ADMINISTRADOR', 'GESTOR_BIENES'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar datos obligatorios
    if (!data.nombre || !data.tipo || data.cantidad === undefined || !data.descripcion || !data.imagenUrl) {
      return NextResponse.json(
        { error: 'Nombre, tipo, cantidad, descripción e imagen son obligatorios' },
        { status: 400 }
      );
    }

    const bien = await prisma.bien.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        cantidad: parseInt(data.cantidad, 10),
        imagenUrl: data.imagenUrl?.trim(),
        descripcion: data.descripcion?.trim(),
      },
    });

    return NextResponse.json(bien);
  } catch (error) {
    console.error('Error updating bien:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el bien' },
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
        { error: 'No autorizado. Solo el administrador puede eliminar bienes' },
        { status: 401 }
      );
    }

    await prisma.bien.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bien eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting bien:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el bien' },
      { status: 500 }
    );
  }
}
