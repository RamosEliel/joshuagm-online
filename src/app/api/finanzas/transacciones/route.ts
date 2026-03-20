import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoTransaccion } from '@prisma/client';
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

    const transacciones = await prisma.transaccion.findMany({
      orderBy: { fecha: 'desc' },
    });

    return NextResponse.json(transacciones);
  } catch (error) {
    console.error('Error fetching transacciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las transacciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMINISTRADOR', 'TESORERO'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores y tesoreros pueden crear transacciones' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validar datos obligatorios
    if (!data.tipo || !data.descripcion || data.monto === undefined) {
      return NextResponse.json(
        { error: 'Tipo, descripción y monto son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que el monto sea positivo
    if (parseFloat(data.monto) <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor que cero' },
        { status: 400 }
      );
    }

    const estadoInput = data.estado ? String(data.estado).trim() : '';
    const estado = Object.values(EstadoTransaccion).includes(estadoInput as EstadoTransaccion)
      ? (estadoInput as EstadoTransaccion)
      : EstadoTransaccion.CONFIRMADA;

    const transaccion = await prisma.transaccion.create({
      data: {
        tipo: data.tipo,
        descripcion: data.descripcion.trim(),
        monto: parseFloat(data.monto),
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        estado,
      },
    });

    return NextResponse.json(transaccion, { status: 201 });
  } catch (error) {
    console.error('Error creating transaccion:', error);
    return NextResponse.json(
      { error: 'Error al crear la transaccion' },
      { status: 500 }
    );
  }
}
