# AGENTS.md — Cardiolife

## Descripción del proyecto
Cardiolife es un sistema de gestión médica para consultorios de cardiología privados en Ecuador. Incluye CRM de pacientes, historias clínicas, evoluciones, recetas médicas, medicamentos y generación de PDFs.

---

## Stack técnico
- **Framework:** Next.js 16.2.4 (App Router)
- **Lenguaje:** TypeScript 5
- **Base de datos:** Supabase (PostgreSQL + Storage + Auth)
- **UI:** shadcn/ui + Tailwind CSS v4 + tw-animate-css
- **Formularios:** React Hook Form 7 + Zod 4
- **Tablas:** TanStack Table v8
- **PDFs:** @react-pdf/renderer
- **Icons:** Lucide React
- **Notificaciones:** Sonner

---

## Estructura de carpetas

```
src/
├── actions/               # Server Actions globales (auth, etc.)
├── app/                   # Next.js App Router
│   ├── api/pdf/           # Route Handler para generación de PDFs
│   ├── dashboard/         # Rutas protegidas del dashboard
│   │   ├── medications/   # CRUD de medicamentos
│   │   ├── patients/      # CRUD de pacientes + historia clínica
│   │   └── recipes/       # Recetas médicas
│   └── login/             # Autenticación
├── components/            # Componentes reutilizables
│   ├── forms/             # Formularios por entidad
│   ├── pdfs/              # Componentes de PDF
│   ├── table/             # Componentes genéricos de tabla
│   └── ui/                # shadcn/ui components (no modificar)
├── hooks/                 # Hooks globales
├── lib/
│   ├── hooks/             # Hooks con lógica de negocio
│   ├── services/          # Servicios de acceso a Supabase
│   ├── supabase/          # Clientes de Supabase
│   │   ├── client.ts      # Browser client ("use client")
│   │   ├── server.ts      # Server client (async, Server Actions/RSC)
│   │   └── proxy.ts       # Middleware de sesión
│   └── validations/       # Schemas Zod por entidad
├── types/                 # Tipos TypeScript
│   ├── database.types.ts  # Generado por Supabase CLI (no modificar)
│   └── patient.d.ts       # Tipos custom
└── proxy.ts               # Proxy raíz (protección de rutas)
```

---

## Clientes de Supabase

### Browser client (componentes con "use client")
```typescript
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // síncrono, sin await
```

### Server client (Server Actions, Server Components, Route Handlers)
```typescript
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // async, siempre con await
```

**Regla crítica:** nunca importar `server.ts` en componentes client ni `client.ts` en Server Actions.

---

## Patrones de código

### Server Actions (patrón preferido para mutaciones)
Todas las operaciones de escritura deben implementarse como Server Actions en `src/actions/`. Nunca llamar a Supabase directamente desde el cliente para mutaciones.

```typescript
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPatient(data: PatientFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("patient").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/patients");
  return { success: true };
}
```

### Server Components (patrón preferido para lectura)
Las páginas deben ser Server Components por defecto. Los datos se obtienen directamente en el componente.

```typescript
// app/dashboard/patients/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: patients } = await supabase.from("patient").select("*");
  return <PatientsTable data={patients ?? []} />;
}
```

### "use client" mínimo
Solo usar `"use client"` cuando el componente necesite: eventos del usuario, estado local (`useState`/`useReducer`), hooks del browser, o animaciones. Las páginas y layouts son Server Components por defecto.

### Servicios (lib/services/)
Los servicios existentes encapsulan la lógica de acceso a Supabase. Al agregar nuevas entidades, crear un servicio equivalente. Los servicios del lado servidor deben recibir el cliente como parámetro o crearlo internamente con `await createClient()`.

### Validaciones con Zod
Todo formulario debe tener su schema en `src/lib/validations/`. Usar el mismo schema para validación cliente (React Hook Form) y servidor (Server Action).

---

## Convenciones de nombrado

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase | `patientData`, `createPatient` |
| Componentes | PascalCase | `PatientForm`, `DataTable` |
| Archivos de componentes | kebab-case | `patient-form.tsx` |
| Archivos de servicios | kebab-case con sufijo | `patients-service.ts` |
| Server Actions | kebab-case con verbo | `create-patient.ts` |
| Campos de BD | snake_case (español) | `nombres`, `fecha_nacimiento` |
| Variables TypeScript | camelCase (inglés) | `firstName`, `birthDate` |

---

## Base de datos

### Tablas principales
- `patient` — datos personales del paciente
- `clinic_history` — historia clínica base (1 por paciente)
- `evolution` — evoluciones/consultas (N por paciente)
- `antecedents` — antecedentes médicos
- `physical_exam` — examen físico
- `paraclinical_exam` — examen paraclínico (EKG)
- `medications` — catálogo de medicamentos
- `medication_categories` — categorías de medicamentos
- `medication_presentations` — presentaciones por medicamento
- `prescriptions` — recetas médicas
- `medical_files` — archivos por paciente
- `notifications_log` — log de notificaciones
- `doctor_profile` — perfil del médico (ligado a auth.users)

### Tipos generados
`src/types/database.types.ts` es generado por Supabase CLI. **No modificar manualmente.** Para regenerar:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

---

## Módulos completados
- ✅ Autenticación (login, sesión, proxy de rutas)
- ✅ Dashboard base con sidebar
- ✅ CRUD de pacientes
- ✅ CRUD de medicamentos
- ✅ Historia clínica (creación)


## Módulos pendientes
- ⏳ Recetas médicas
- ⏳ Generación de PDFs (recetas)
- ⏳ Evoluciones de pacientes
- ⏳ Edición de historia clínica
- ⏳ Envío de recetas por email
- ⏳ Subida de archivos por paciente (Supabase Storage)
- ⏳ Notificaciones
- ⏳ Dashboard con KPIs y gráficos
- ⏳ Búsqueda clínica estructurada
- ⏳ RAG con búsqueda semántica (pgvector) - Fase muy futura

---

## Dashboard — KPIs y gráficos

### Librería de gráficos
Usar **Recharts** a través del componente oficial de shadcn (`<ChartContainer>`). No instalar otras librerías de gráficos.

```bash
pnpm add recharts
```

Los datos para los gráficos se obtienen en Server Components y se pasan como props — nunca fetchear desde el cliente.

### KPIs planeados (a confirmar con el médico)
- Consultas por mes (gráfico de barras o línea)
- Pacientes nuevos vs recurrentes
- Medicamento más recetado
- Diagnósticos más frecuentes
- Distribución de pacientes por edad/género

### Patrón de implementación
```typescript
// app/dashboard/page.tsx — Server Component
import { createClient } from "@/lib/supabase/server";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ConsultationsChart } from "@/components/dashboard/consultations-chart";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: totalPatients }, consultationsByMonth, topMedications] =
    await Promise.all([
      supabase.from("patient").select("*", { count: "exact", head: true }),
      supabase.rpc("get_consultations_by_month"),
      supabase.rpc("get_top_medications"),
    ]);

  return (
    <div>
      <KpiCards totalPatients={totalPatients} />
      <ConsultationsChart data={consultationsByMonth} />
    </div>
  );
}
```

Las queries complejas de agregación se implementan como funciones RPC en Supabase (SQL functions) y se llaman con `supabase.rpc()`.

---

## RAG — Búsqueda clínica e inteligencia

### Dos niveles de búsqueda planeados

**Nivel 1 — Búsqueda estructurada (MVP)**
Filtros avanzados sobre datos existentes. No requiere librerías adicionales — son queries SQL sobre `antecedents`, `evolution`, `prescriptions`.

Ejemplos:
- "¿Cuántos pacientes tienen hipertensión y diabetes?"
- "Pacientes con diagnóstico I10 en los últimos 3 meses"
- "Medicamentos más recetados este año"

Implementar como Server Actions que reciben filtros y retornan resultados paginados.

**Nivel 2 — Búsqueda semántica con pgvector (Fase futura)**
Permite encontrar pacientes con perfiles clínicos similares usando embeddings.

Requiere:
- Habilitar `pgvector` en Supabase (ya disponible gratis)
- Generar embeddings de perfiles clínicos con OpenAI Embeddings API o similar
- Columna `embedding vector(1536)` en tabla de historias clínicas
- Función de búsqueda por similitud coseno

```sql
-- Ejemplo de query semántica futura
select patient_id, 1 - (embedding <=> query_embedding) as similarity
from clinical_embeddings
order by similarity desc
limit 10;
```

### Orden de implementación
1. Primero búsqueda estructurada (filtros SQL) — valor inmediato, sin complejidad
2. pgvector cuando haya suficientes historias clínicas para que la búsqueda semántica sea útil

---

## Storage — Archivos médicos

### Proveedor: Supabase Storage
Decisión: usar Supabase Storage para todos los archivos del consultorio. No usar Cloudinary.

**Razones:**
- RLS aplica al storage — misma política de seguridad que la DB
- Un solo médico no supera los 100GB incluidos en Pro por años
- Sin dependencia externa adicional
- URLs firmadas para acceso seguro a archivos clínicos

### Tipos de archivo soportados
Definidos en el enum `file_type` de la DB:
`prescription`, `echocardiogram`, `holter`, `lab`, `ecg`, `xray`, `other`

### Estructura de buckets en Supabase
```
medical-files/
└── {patient_id}/
    └── {filename}
```

### Patrón de upload (Server Action)
```typescript
"use server";
import { createClient } from "@/lib/supabase/server";

export async function uploadMedicalFile(patientId: string, file: File) {
  const supabase = await createClient();
  const path = `${patientId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("medical-files")
    .upload(path, file);

  if (error) return { error: error.message };

  const { data } = supabase.storage
    .from("medical-files")
    .getPublicUrl(path);

  return { success: true, url: data.publicUrl };
}
```

---

## Reglas importantes

1. **Server Actions sobre API Routes** — usar Server Actions para toda mutación. Las API Routes (`/api/`) solo para webhooks externos o generación de PDFs que requieran streaming.
2. **No usar `@supabase/auth-helpers-nextjs`** — paquete eliminado. Usar únicamente `@supabase/ssr`.
3. **No modificar `src/components/ui/`** — son componentes generados por shadcn. Extender creando componentes nuevos en `src/components/`.
4. **No modificar `database.types.ts`** — generado automáticamente.
5. **Revalidar paths después de mutaciones** — siempre llamar `revalidatePath()` en Server Actions después de escrituras exitosas.
6. **Manejo de errores consistente** — las Server Actions retornan `{ error: string }` en caso de fallo y `{ success: true }` en caso de éxito.
7. **Nombres de campos en español** — los campos de la base de datos están en español siguiendo el schema de Supabase. Las variables TypeScript van en inglés.

---

## Variables de entorno requeridas
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```