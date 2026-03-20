import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const UNIFORME_ITEMS = [
  {
    nombre: 'Camisa/Blusa blanca tipo militar',
    descripcion: 'Camisa o blusa blanca tipo militar para Guía Mayor.',
    imagenUrl: '/uniforme/camisa-blusa.svg',
    orden: 1,
  },
  {
    nombre: 'Falda linea A gris oxford (damas)',
    descripcion: 'Falda linea A gris oxford para damas.',
    imagenUrl: '/uniforme/falda.svg',
    orden: 2,
  },
  {
    nombre: 'Pantalon gris oxford (caballeros)',
    descripcion: 'Pantalon gris oxford para caballeros.',
    imagenUrl: '/uniforme/pantalon.svg',
    orden: 3,
  },
  {
    nombre: 'Corbata/Corbatin vino tinto',
    descripcion: 'Corbata o corbatin color vino tinto.',
    imagenUrl: '/uniforme/corbata-corbatin.svg',
    orden: 4,
  },
  {
    nombre: 'Cinturon negro (caballeros)',
    descripcion: 'Correa o cinturon negro.',
    imagenUrl: '/uniforme/cinturon.svg',
    orden: 5,
  },
  {
    nombre: 'Zapatos negros',
    descripcion: 'Zapatos negros del uniforme.',
    imagenUrl: '/uniforme/zapatos.svg',
    orden: 6,
  },
  {
    nombre: 'Boina negra',
    descripcion: 'Boina negra oficial.',
    imagenUrl: '/uniforme/boina.svg',
    orden: 7,
  },
  {
    nombre: 'Banda de especialidades gris oxford',
    descripcion: 'Banda para especialidades, color gris oxford.',
    imagenUrl: '/uniforme/banda.svg',
    orden: 8,
  },
  {
    nombre: 'Medias de nylon color piel / calcetines gris',
    descripcion: 'Medias de nylon color piel (damas) o calcetines color gris (caballeros).',
    imagenUrl: '/uniforme/medias-calcetines.svg',
    orden: 9,
  },
  {
    nombre: 'Panuelo amarillo con logo de Guías Mayores y tubo',
    descripcion: 'Panuelo amarillo con el logo y tubo correspondiente.',
    imagenUrl: '/uniforme/panuelo.svg',
    orden: 10,
  },
  {
    nombre: 'Sueter del club',
    descripcion: 'Sueter oficial del club (complementario).',
    imagenUrl: '/uniforme/sueter.svg',
    orden: 11,
  },
];

async function ensureUniformItems() {
  const count = await prisma.uniformItem.count();
  if (count === 0) {
    await prisma.uniformItem.createMany({
      data: UNIFORME_ITEMS,
    });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await ensureUniformItems();

    const items = await prisma.uniformItem.findMany({
      orderBy: { orden: 'asc' },
      include: {
        userItems: {
          where: { userId: session.user.id },
          select: { adquirido: true },
        },
      },
    });

    const response = items.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      imagenUrl: item.imagenUrl,
      orden: item.orden,
      adquirido: item.userItems[0]?.adquirido ?? false,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching uniforme items:', error);
    return NextResponse.json({ error: 'Error al cargar uniforme' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const itemId = String(data.itemId || '').trim();
    const adquirido = Boolean(data.adquirido);

    if (!itemId) {
      return NextResponse.json({ error: 'Item requerido' }, { status: 400 });
    }

    const record = await prisma.userUniformItem.upsert({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
      update: { adquirido },
      create: {
        userId: session.user.id,
        itemId,
        adquirido,
      },
    });

    return NextResponse.json({ ok: true, adquirido: record.adquirido });
  } catch (error) {
    console.error('Error updating uniforme item:', error);
    return NextResponse.json({ error: 'Error al actualizar uniforme' }, { status: 500 });
  }
}
