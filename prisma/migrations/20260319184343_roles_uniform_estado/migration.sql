-- Create new enums (guarded for re-run)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoCuentaPendiente') THEN
    CREATE TYPE "EstadoCuentaPendiente" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoTransaccion') THEN
    CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'ANULADA');
  END IF;
END $$;

-- Add relation between User and GuiaMayor (guarded)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "guiaMayorId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_guiaMayorId_key') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_guiaMayorId_key" UNIQUE ("guiaMayorId");
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_guiaMayorId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_guiaMayorId_fkey"
      FOREIGN KEY ("guiaMayorId") REFERENCES "GuiaMayor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add estado to Transaccion
ALTER TABLE "Transaccion" ADD COLUMN IF NOT EXISTS "estado" "EstadoTransaccion" NOT NULL DEFAULT 'CONFIRMADA';

-- Convert estado on CuentaPendiente to enum (only if estado is text)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'CuentaPendiente'
      AND column_name = 'estado'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE "CuentaPendiente" ADD COLUMN IF NOT EXISTS "estado_new" "EstadoCuentaPendiente" NOT NULL DEFAULT 'PENDIENTE';
    UPDATE "CuentaPendiente"
    SET "estado_new" = (
      CASE
        WHEN lower("estado") IN ('completado', 'completa', 'pagada', 'pagado') THEN 'PAGADA'
        WHEN lower("estado") IN ('vencida', 'vencido') THEN 'VENCIDA'
        WHEN lower("estado") IN ('anulada', 'anulado') THEN 'ANULADA'
        ELSE 'PENDIENTE'
      END
    )::"EstadoCuentaPendiente";
    ALTER TABLE "CuentaPendiente" DROP COLUMN "estado";
    ALTER TABLE "CuentaPendiente" RENAME COLUMN "estado_new" TO "estado";
  END IF;
END $$;

-- Track who registered usage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='UsoBienCampamento'
  ) THEN
    CREATE TABLE "UsoBienCampamento" (
      "id" TEXT NOT NULL,
      "bienId" TEXT NOT NULL,
      "guiaMayorId" TEXT NOT NULL,
      "campamentoNum" INTEGER NOT NULL,
      "fechaUso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "cantidadUsada" INTEGER NOT NULL DEFAULT 1,
      "observaciones" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "UsoBienCampamento_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "UsoBienCampamento_bienId_guiaMayorId_campamentoNum_key"
      ON "UsoBienCampamento"("bienId", "guiaMayorId", "campamentoNum");

    ALTER TABLE "UsoBienCampamento" ADD CONSTRAINT "UsoBienCampamento_bienId_fkey"
      FOREIGN KEY ("bienId") REFERENCES "Bien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "UsoBienCampamento" ADD CONSTRAINT "UsoBienCampamento_guiaMayorId_fkey"
      FOREIGN KEY ("guiaMayorId") REFERENCES "GuiaMayor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "UsoBienCampamento" ADD COLUMN IF NOT EXISTS "registradoPorId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UsoBienCampamento_registradoPorId_fkey') THEN
    ALTER TABLE "UsoBienCampamento" ADD CONSTRAINT "UsoBienCampamento_registradoPorId_fkey"
      FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Uniform items catalog
CREATE TABLE IF NOT EXISTS "UniformItem" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "imagenUrl" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UniformItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserUniformItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "adquirido" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserUniformItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserUniformItem_userId_itemId_key" ON "UserUniformItem"("userId", "itemId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserUniformItem_userId_fkey') THEN
    ALTER TABLE "UserUniformItem" ADD CONSTRAINT "UserUniformItem_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserUniformItem_itemId_fkey') THEN
    ALTER TABLE "UserUniformItem" ADD CONSTRAINT "UserUniformItem_itemId_fkey"
      FOREIGN KEY ("itemId") REFERENCES "UniformItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
