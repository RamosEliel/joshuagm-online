-- Create new enums
CREATE TYPE "EstadoCuentaPendiente" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');
CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'ANULADA');

-- Add relation between User and GuiaMayor
ALTER TABLE "User" ADD COLUMN "guiaMayorId" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_guiaMayorId_key" UNIQUE ("guiaMayorId");
ALTER TABLE "User" ADD CONSTRAINT "User_guiaMayorId_fkey" FOREIGN KEY ("guiaMayorId") REFERENCES "GuiaMayor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add estado to Transaccion
ALTER TABLE "Transaccion" ADD COLUMN "estado" "EstadoTransaccion" NOT NULL DEFAULT 'CONFIRMADA';

-- Convert estado on CuentaPendiente to enum
ALTER TABLE "CuentaPendiente" ADD COLUMN "estado_new" "EstadoCuentaPendiente" NOT NULL DEFAULT 'PENDIENTE';
UPDATE "CuentaPendiente"
SET "estado_new" = CASE
  WHEN lower("estado") IN ('completado', 'completa', 'pagada', 'pagado') THEN 'PAGADA'
  WHEN lower("estado") IN ('vencida', 'vencido') THEN 'VENCIDA'
  WHEN lower("estado") IN ('anulada', 'anulado') THEN 'ANULADA'
  ELSE 'PENDIENTE'
END;
ALTER TABLE "CuentaPendiente" DROP COLUMN "estado";
ALTER TABLE "CuentaPendiente" RENAME COLUMN "estado_new" TO "estado";

-- Track who registered usage
ALTER TABLE "UsoBienCampamento" ADD COLUMN "registradoPorId" TEXT;
ALTER TABLE "UsoBienCampamento" ADD CONSTRAINT "UsoBienCampamento_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Uniform items catalog
CREATE TABLE "UniformItem" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "imagenUrl" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UniformItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserUniformItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "adquirido" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserUniformItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserUniformItem_userId_itemId_key" ON "UserUniformItem"("userId", "itemId");

ALTER TABLE "UserUniformItem" ADD CONSTRAINT "UserUniformItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserUniformItem" ADD CONSTRAINT "UserUniformItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "UniformItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
