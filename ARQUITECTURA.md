# Arquitectura del Proyecto Joshua GM Online

## Resumen
Sistema de gestión para clubes de Guías Mayores con control de membresía, finanzas, inventario de bienes y eventos.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19 + TypeScript |
| Estilos | CSS Modules |
| ORM | Prisma 7.4.2 |
| Base de datos | PostgreSQL |
| Autenticación | NextAuth.js v4 |
| Seguridad | bcryptjs |

## Estructura de Carpetas

```
├── prisma/
│   └── schema.prisma          # Modelos de datos
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── api/              # API Routes (REST)
│   │   ├── dashboard/        # Panel administrativo
│   │   │   ├── gui-mayor/    # CRUD Guías Mayores
│   │   │   ├── finanzas/     # Gestión financiera
│   │   │   ├── bienes/       # Inventario
│   │   │   └── eventos/      # Actividades y eventos
│   │   ├── login/            # Autenticación
│   │   └── page.tsx          # Landing page
│   ├── components/           # Componentes React
│   │   └── layout/           # Header, Sidebar
│   ├── lib/                  # Utilidades
│   │   ├── prisma.ts         # Cliente Prisma
│   │   └── auth.ts           # Config NextAuth
│   └── types/                # Tipos TypeScript
```

## Modelos de Datos

### Roles de Usuario
- `ADMINISTRADOR` - Acceso total
- `TESORERO` - Gestión financiera
- `GESTOR_BIENES` - Inventario
- `GM` - Visualización

### Entidades Principales

| Entidad | Descripción |
|---------|-------------|
| `User` | Usuarios del sistema (autenticación) |
| `GuiaMayor` | Información personal de GM |
| `Transaccion` | Ingresos y egresos del club |
| `CuentaPendiente` | Compras pendientes por pagar |
| `Bien` | Inventario de bienes del club |
| `Actividad` | Eventos y actividades |
| `ActividadGM` | Relación GM-Actividad |
| `FinanzaGM` | Finanzas individuales por GM |

## Módulos Implementados

### 1. Guías Mayores ✅
- CRUD completo
- Campos: nombres, apellidos, fecha nacimiento, tipo sangre, cargo, teléfono, edad, participaciones campamento, estado
- Avatar

### 2. Finanzas ✅
- Presupuesto total del club
- Transacciones (ingresos/egresos)
- Cuentas pendientes
- Finanzas por GM (bienes a adquirir, abonos)

### 3. Bienes del Club ✅
- CRUD de bienes
- Campos: nombre, tipo, cantidad, imagen
- Categorización por tipos

### 4. Eventos/Actividades ✅
- Tipo: Evento o Actividad
- Nombre, descripción
- Fechas de inicio/fin
- Tiempo restante calculado
- GM participantes

## API Routes

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/gui-mayor` | GET, POST | Listar/crear GM |
| `/api/gui-mayor/[id]` | GET, PUT, DELETE | CRUD individual |
| `/api/bienes` | GET, POST | Listar/crear bienes |
| `/api/bienes/[id]` | GET, PUT, DELETE | CRUD bienes |
| `/api/actividad` | GET, POST | Listar/crear actividades |
| `/api/actividad/[id]` | GET, PUT, DELETE | CRUD actividades |
| `/api/finanzas/transacciones` | GET, POST | Transacciones |
| `/api/finanzas/cuentas` | GET, POST | Cuentas pendientes |
| `/api/finanzas/gm` | GET, POST | Finanzas por GM |
| `/api/auth/[...nextauth]` | - | Autenticación |

## Seguridad

- Autenticación con NextAuth (credentials)
- Roles y permisos por endpoint
- Protección de rutas con middleware de sesión
- Contraseñas hasheadas con bcryptjs

## Mejoras Implementadas

1. ✅ **Seguimiento de uso de bienes**: Modelo `UsoBienCampamento` para registrar qué bienes usó cada GM en cada campamento
2. ✅ **Categorías de bienes**: Enum `CategoriaBien` con tipos específicos (Artículos de Acampar, Equipo de Cocina, etc.)
3. ✅ **API de uso de bienes**: Endpoint `/api/bienes/uso-campamento` para gestionar registros
4. ✅ **Página de uso de bienes**: Interfaz para visualizar y registrar uso de bienes en campamentos

## Mejoras Pendientes

1. **Cálculo dinámico de edad**: Calcular edad desde fecha de nacimiento en lugar de campo estático
2. **Reportes**: Generación de reportes PDF/Excel
3. **Notificaciones**: Alertas de eventos próximos
4. **Dashboard de uso de bienes**: Estadísticas de uso por campamento y GM
