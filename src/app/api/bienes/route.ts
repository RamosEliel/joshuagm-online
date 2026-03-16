import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const bienes = await prisma.bien.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bienes);
  } catch (error) {
    console.error('Error fetching bienes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los bienes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'GESTOR_BIENES'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const bien = await prisma.bien.create({
      data: {
        nombre: data.nombre,
        categoria: data.categoria || 'OTROS',
        tipo: data.tipo,
        cantidad: parseInt(data.cantidad),
        imagenUrl: data.imagenUrl || null,
        descripcion: data.descripcion || null,
      },
    });

    return NextResponse.json(bien, { status: 201 });
  } catch (error) {
    console.error('Error creating bien:', error);
    return NextResponse.json(
      { error: 'Error al crear el bien' },
      { status: 500 }
    );
  }
}
