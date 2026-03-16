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

    const guiasMayores = await prisma.guiaMayor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(guiasMayores);
  } catch (error) {
    console.error('Error fetching guias mayores:', error);
    return NextResponse.json(
      { error: 'Error al obtener los guías mayores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO', 'GESTOR_BIENES'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const guiaMayor = await prisma.guiaMayor.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        fechaNacimiento: new Date(data.fechaNacimiento),
        tipoSangre: data.tipoSangre,
        cargo: data.cargo,
        telefono: data.telefono,
        edad: parseInt(data.edad),
        participacionesCampamento: parseInt(data.participacionesCampamento) || 0,
        estado: data.estado || 'ACTIVO',
      },
    });

    return NextResponse.json(guiaMayor, { status: 201 });
  } catch (error) {
    console.error('Error creating guia mayor:', error);
    return NextResponse.json(
      { error: 'Error al crear el guía mayor' },
      { status: 500 }
    );
  }
}
