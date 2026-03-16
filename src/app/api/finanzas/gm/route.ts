import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const finanzasGM = await prisma.finanzaGM.findMany({
      include: {
        guiaMayor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(finanzasGM);
  } catch (error) {
    console.error('Error fetching finanzas GM:', error);
    return NextResponse.json(
      { error: 'Error al obtener las finanzas GM' },
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

    // Validar datos obligatorios
    if (!data.tipo || !data.descripcion || data.valor === undefined) {
      return NextResponse.json(
        { error: 'Tipo, descripción y valor son obligatorios' },
        { status: 400 }
      );
    }

    const finanzaGM = await prisma.finanzaGM.create({
      data: {
        guiaMayorId: data.guiaMayorId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        valor: parseFloat(data.valor),
        pagosRealizados: parseFloat(data.pagosRealizados) || 0,
      },
    });

    return NextResponse.json(finanzaGM, { status: 201 });
  } catch (error) {
    console.error('Error creating finanza GM:', error);
    return NextResponse.json(
      { error: 'Error al crear la finanza GM' },
      { status: 500 }
    );
  }
}
