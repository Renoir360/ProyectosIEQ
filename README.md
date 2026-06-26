# IEQ Pendientes 2026 - Dashboard IT

Aplicación Fullstack para la gestión de proyectos y pendientes IT 2026.

## Stack
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma (v5)
- **Deploy**: Vercel

## Configuración Local
1. Clonar repositorio.
2. Copiar `.env.example` a `.env` y configurar credenciales de Supabase.
   - `DATABASE_URL`: Connection Pooler (Port 6543)
   - `DIRECT_URL`: Direct Connection (Port 5432)
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Generar cliente Prisma:
   ```bash
   npx prisma generate
   ```
5. Migrar base de datos:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Cargar datos semilla (Seed):
   ```bash
   npm run seed
   ```
7. Iniciar servidor:
   ```bash
   npm run dev
   ```

## Deploy en Vercel
1. Crear nuevo proyecto en Vercel importando este repositorio.
2. Configurar **Environment Variables**:
   - `DATABASE_URL`
   - `DIRECT_URL`
3. En **Build & Development Settings**:
   - Build Command: `npm run vercel-build` (Preconfigurado en package.json para ejecutar migraciones).
4. Deploy.

## Arquitectura
- `/app`: Rutas y Vistas (Server Components por defecto).
- `/components`: UI reutilizable (Client Components para interactividad).
- `/lib/db.ts`: Singleton de Prisma.
- `/lib/validators`: Schemas Zod.
- `/prisma`: Schema y Seed.
