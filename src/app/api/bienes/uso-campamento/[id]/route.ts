import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'GESTOR_BIENES', 'GM'].includes(session.user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data = await request.json();

    const uso = await prisma.usoBienCampamento.findUnique({
      where: { id },
      select: { id: true, registradoPorId: true, guiaMayorId: true },
    });

    if (!uso) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    if (session.user.rol === 'GM') {
      if (!uso.registradoPorId || uso.registradoPorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Solo puedes modificar registros creados por ti' },
          { status: 403 }
        );
      }
    }

    if (!data.campamentoNum) {
      return NextResponse.json({ error: 'Campamento requerido' }, { status: 400 });
    }

    const updated = await prisma.usoBienCampamento.update({
      where: { id },
      data: {
        campamentoNum: parseInt(data.campamentoNum),
        cantidadUsada: parseInt(data.cantidadUsada) || 1,
        observaciones: data.observaciones || null,
        fechaUso: data.fechaUso ? new Date(data.fechaUso) : undefined,
      },
      include: {
        bien: true,
        guiaMayor: {
          select: { id: true, nombres: true, apellidos: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating uso bien:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el registro' },
      { status: 500 }
    );
  }
}
