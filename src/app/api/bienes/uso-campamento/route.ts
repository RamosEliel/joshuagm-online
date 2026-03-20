import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Obtener registros de uso de bienes en campamentos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guiaMayorId = searchParams.get('guiaMayorId');
    const bienId = searchParams.get('bienId');
    const campamentoNum = searchParams.get('campamentoNum');

    const where: any = {};
    const isGM = session.user.rol === 'GM';
    if (isGM) {
      if (!session.user.guiaMayorId) {
        return NextResponse.json(
          { error: 'Guía Mayor no asociado al usuario' },
          { status: 400 }
        );
      }
      where.guiaMayorId = session.user.guiaMayorId;
    }
    if (!isGM && guiaMayorId) where.guiaMayorId = guiaMayorId;
    if (bienId) where.bienId = bienId;
    if (campamentoNum) where.campamentoNum = parseInt(campamentoNum);

    const usos = await prisma.usoBienCampamento.findMany({
      where,
      include: {
        bien: true,
        guiaMayor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: { fechaUso: 'desc' },
    });

    return NextResponse.json(usos);
  } catch (error) {
    console.error('Error fetching usos bienes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los registros de uso' },
      { status: 500 }
    );
  }
}

// POST - Registrar uso de bien en campamento
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'GESTOR_BIENES', 'GM'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.bienId || !data.guiaMayorId || !data.campamentoNum) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: bienId, guiaMayorId, campamentoNum' },
        { status: 400 }
      );
    }

    // Verificar que el bien existe
    const bien = await prisma.bien.findUnique({
      where: { id: data.bienId },
    });

    if (!bien) {
      return NextResponse.json(
        { error: 'El bien no existe' },
        { status: 404 }
      );
    }

    // Verificar que el GM existe
    const guiaMayor = await prisma.guiaMayor.findUnique({
      where: { id: data.guiaMayorId },
    });

    if (!guiaMayor) {
      return NextResponse.json(
        { error: 'El Guía Mayor no existe' },
        { status: 404 }
      );
    }

    if (session.user.rol === 'GM') {
      if (!session.user.guiaMayorId || session.user.guiaMayorId !== data.guiaMayorId) {
        return NextResponse.json(
          { error: 'Solo puedes registrar usos para tu propio registro' },
          { status: 403 }
        );
      }
    }

    // Crear el registro de uso
    const uso = await prisma.usoBienCampamento.create({
      data: {
        bienId: data.bienId,
        guiaMayorId: data.guiaMayorId,
        campamentoNum: parseInt(data.campamentoNum),
        cantidadUsada: parseInt(data.cantidadUsada) || 1,
        observaciones: data.observaciones || null,
        fechaUso: data.fechaUso ? new Date(data.fechaUso) : new Date(),
        registradoPorId: session.user.id,
      },
      include: {
        bien: true,
        guiaMayor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    return NextResponse.json(uso, { status: 201 });
  } catch (error) {
    console.error('Error creating uso bien:', error);
    return NextResponse.json(
      { error: 'Error al registrar el uso del bien' },
      { status: 500 }
    );
  }
}
