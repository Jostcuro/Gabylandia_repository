# Gabylandia · Gestión Operativa de Eventos (Fullstack)

Aplicación web para organizar reservas, montajes y pendientes de producción para Gabylandia.

## Stack

- Frontend: Vite + React + TypeScript + Tailwind (paleta rosa/dorado).
- Backend: Node.js + Express + Prisma en arquitectura por capas.
- Persistencia global: Supabase PostgreSQL.
- Backup externo: Google Sheets.
- Hosting: Netlify (frontend) + Render (backend).

## Módulos implementados

1. **Gestión centralizada de eventos**
   - Fecha reserva, fecha/hora evento, dirección, estado.
   - Datos de cliente/festejado.
   - Temática + descripción técnica.
   - Hasta 3 URLs de imágenes.

2. **Checklist operativo por evento**
   - Categorías: Fijos, Por evento, Taller/Producción, Consumibles, Adicionales.
   - Estados: Falta, En proceso, Listo.
   - Barra de progreso por evento.

3. **Automatización y conectividad**
   - Local cache en navegador cuando falla el backend.
   - Botón WhatsApp para resumen de pendientes.
   - Backup append-only en Google Sheets por cambios críticos.

4. **Dashboard de negocio**
   - Total eventos, eventos del mes, ingresos, ítems faltantes.
   - Verificador de disponibilidad por fecha (Libre/Ocupado).

5. **Plantillas de checklist**
   - Crear plantillas temáticas y aplicarlas al crear evento.

6. **Módulo financiero**
   - Campos: `price`, `advancePayment`, `balanceDue` (calculado automáticamente).
   - Visualización de estado: 🔴 pendiente / 🟢 pagado.

## Arquitectura en capas (backend)

- `Controller`: valida y transforma entrada/salida HTTP.
- `Service`: reglas de negocio y flujos (WhatsApp + backup).
- `Repository`: acceso a Prisma.
- `DB`: PostgreSQL modelado en Prisma.

## Endpoints principales

- `GET /api/events`
- `POST /api/events`
- `POST /api/events/:eventId/checklist-items`
- `PATCH /api/events/checklist-items/:itemId`
- `GET /api/events/:eventId/whatsapp-summary`
- `GET /api/templates`
- `POST /api/templates`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/availability?date=YYYY-MM-DD`

## Variables de entorno

Backend (`apps/backend/.env`):

```bash
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
FRONTEND_URL=https://tu-frontend.netlify.app
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_ID=1AbCdEf...
GOOGLE_SHEETS_TAB=backup
```

Frontend (`apps/frontend/.env`):

```bash
VITE_API_URL=https://tu-backend.onrender.com/api
```

## Google Sheets + Apps Script (respaldo opcional adicional)

Además del append desde backend, puedes pegar este script en Google Apps Script para recibir snapshots manuales:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('snapshot');
  const body = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), body.eventId, body.theme, body.status, body.balanceDue, JSON.stringify(body)]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

## Run local

```bash
npm install
npm run prisma:generate --workspace apps/backend
npx prisma migrate dev --schema apps/backend/prisma/schema.prisma --name init
npm run dev:backend
npm run dev:frontend
```
