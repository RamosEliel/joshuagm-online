import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Solo ADMINISTRADOR y TESORERO pueden ver cuentas
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const cuentas = await prisma.cuentaPendiente.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cuentas);
  } catch (error) {
    console.error('Error fetching cuentas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las cuentas pendientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Solo ADMINISTRADOR y TESORERO pueden crear cuentas
    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores y tesoreros pueden crear cuentas' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar datos obligatorios
    if (!data.descripcion || data.montoTotal === undefined) {
      return NextResponse.json(
        { error: 'Descripción y monto total son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que el monto total sea positivo
    if (parseFloat(data.montoTotal) <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor que cero' },
        { status: 400 }
      );
    }

    const montoReunido = parseFloat(data.montoReunido) || 0;

    // Validar que el monto reunido no exceda el total
    if (montoReunido > parseFloat(data.montoTotal)) {
      return NextResponse.json(
        { error: 'El monto reunido no puede exceder el monto total' },
        { status: 400 }
      );
    }

    const cuenta = await prisma.cuentaPendiente.create({
      data: {
        descripcion: data.descripcion.trim(),
        montoTotal: parseFloat(data.montoTotal),
        montoReunido: montoReunido,
        estado: montoReunido >= parseFloat(data.montoTotal) ? 'completado' : 'pendiente',
        guiaMayorId: data.guiaMayorId || null,
      },
    });

    return NextResponse.json(cuenta, { status: 201 });
  } catch (error) {
    console.error('Error creating cuenta:', error);
    return NextResponse.json(
      { error: 'Error al crear la cuenta pendiente' },
      { status: 500 }
    );
  }
}
