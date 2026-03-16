# Joshua GM Online

Sistema web (Next.js + Prisma + Postgres) para la gestion del club de Guias Mayores:

- Autenticacion con `next-auth` (Credentials).
- Modulo de Guias Mayores (CRUD).
- Modulo de Bienes (inventario, CRUD).
- Modulo de Eventos y Actividades (CRUD + asignacion de guias).
- Modulo de Finanzas (transacciones + cuentas pendientes).
- Modulo de Finanzas por Guia Mayor.

## Requisitos

- Node.js (recomendado 20+)
- Postgres

## Configuracion

1. Instalar dependencias

```bash
npm install
```

2. Crear `.env` usando `.env.example`

Variables minimas:

- `DATABASE_URL`
- `DIRECT_URL` (recomendado si `DATABASE_URL` es pooled)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

3. Aplicar el schema de Prisma a la base de datos

Para despliegue en Vercel, usa migraciones:

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Crear usuario administrador

Configura:

- `SETUP_TOKEN`
- `ADMIN_EMAIL` (opcional, default `admin@joshuagm.com`)
- `ADMIN_PASSWORD`

En produccion (Vercel), habilitalo solo temporalmente:

- `ALLOW_PROD_SETUP=true` (y luego vuelvelo a `false` o elimínalo)

Luego ejecuta:

```bash
curl -X POST http://localhost:3000/api/setup ^
  -H "x-setup-token: TU_TOKEN"
```

## Ejecutar

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Roles

- `ADMINISTRADOR`: acceso completo.
- `TESORERO`: finanzas y eventos (segun endpoints).
- `GESTOR_BIENES`: bienes e inventario.
- `GM`: acceso de lectura a modulos no financieros (segun endpoints).
