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

    const actividades = await prisma.actividad.findMany({
      orderBy: { fechaInicio: 'asc' },
      include: {
        guiasMayores: {
          include: {
            guiaMayor: true,
          },
        },
      },
    });

    return NextResponse.json(actividades);
  } catch (error) {
    console.error('Error fetching actividades:', error);
    return NextResponse.json(
      { error: 'Error al obtener las actividades' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const actividad = await prisma.actividad.create({
      data: {
        tipo: data.tipo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        guiasMayores: {
          create: data.guiasMayores?.map((gmId: string) => ({
            guiaMayorId: gmId,
          })) || [],
        },
      },
    });

    return NextResponse.json(actividad, { status: 201 });
  } catch (error) {
    console.error('Error creating actividad:', error);
    return NextResponse.json(
      { error: 'Error al crear la actividad' },
      { status: 500 }
    );
  }
}
