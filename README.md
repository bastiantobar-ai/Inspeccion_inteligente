# Inspección Inteligente (réplica)

Next.js (App Router) + Supabase. Genera checklists de inspección a partir de marca/modelo/versión/año/km.

## Deploy

1. Crear proyecto en Supabase, correr las migraciones de `supabase/schema.sql` (pendiente) y cargar los datos de las sheets.
2. En Vercel: New Project → importar este repo → variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (ver `.env.example`).
3. Deploy.

## Desarrollo local

Requiere Node 18+.

```bash
npm install
npm run dev
```
