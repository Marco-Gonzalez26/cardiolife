# Cardiolife — Esquema de base de datos (Supabase)

Snapshot del esquema `public` al **2026-10-03**, obtenido con el MCP de Supabase y la migración
`clinic_history_drafts_and_rls_hardening`. Los tipos TypeScript equivalentes están en
`src/types/database.types.ts` (generado; no editar a mano).

> Datos al 2026-10-03: 2 pacientes (ambos con médico y con `user_id`), 1 historia clínica, 10 citas, 1 médico,
> 0 secretarias. Valores existentes: `patient.risk = 'Bajo'`, `patient.status = 'Estable'` (aún no hay 'Alto').

## Mapa de relaciones

```
auth.users ─┬─ doctor_profile (id = auth.users.id)
            │       └─< patient (doctor_profile_id)   ── patient.user_id → auth.users (portal del paciente)
            └─ doctor_secretaries (doctor_id, secretary_id)  ← secretaria asignada a un médico

patient ─┬─< clinic_history ─┬─ antecedents       (antecedents_id)
         │                   ├─ physical_exam     (physical_exam_id)
         │                   ├─ paraclinical_exam (paraclinical_exam_id)
         │                   ├─< evolution        (clinic_history_id, ON DELETE CASCADE)
         │                   └─< prescriptions    (clinic_history_id)
         ├─< evolution ─┬─< prescriptions (evolution_id)
         │              └─< medical_files (evolution_id)
         ├─< prescriptions ── medication_id → medications ── category_id → medication_categories
         │                 └─ presentation_id → medication_presentations (medication_id → medications)
         ├─< medical_files
         ├─< citas
         └─< notifications_log
```

Los exámenes **no** apuntan a `clinic_history`: es `clinic_history` quien guarda sus ids
(`ON DELETE SET NULL`). Para leer todo junto: `select('*, antecedents(*), physical_exam(*), paraclinical_exam(*)')`.

## Tablas

### patient
`id uuid`, `created_at`, `names`, `lastnames`, `identification`, `birthdate date`, `age varchar`,
`phone_number`, `email`, `job`, `blood_type`, `status` (default `'Estable'`), `risk` (default `'Bajo'`),
`doctor_profile_id → doctor_profile`, `user_id → auth.users` (cuenta del paciente para el portal).

### clinic_history
`id bigint (identity)`, `created_at`, `date timestamptz`, `reason`, `diagnosis`, `treatment_plan`,
`patient_id` (NOT NULL), `doctor_profile_id` (NOT NULL), `antecedents_id`, `physical_exam_id`, `paraclinical_exam_id`,
**`status` (`draft` | `completed`, default `completed`)**, **`created_by → auth.users`**.
Constraint: una historia `completed` exige `reason` y `diagnosis`.

### antecedents
`id`, `created_at`, `created_by`, `current_disease varchar`, y columnas **jsonb** con forma `{ "status": boolean, "details": string }`:
`hta`, `diabetes`, `dyslipidemia`, `heart_disease`, `thyroid_disease`, `kidney_disease`, `gastric_disease`,
`cardiovascular_disease`, `cardiac`, `neuropathy`, `cancer`, `stroke`, `syncope`, `surgeries`, `alergies`, `covid`,
`cigarette`, `alcohol`, `drugs`, `exercise`, `religion`, `father`, `mother`.

### physical_exam
`id`, `created_at`, `created_by`, `systolic_bp`, `dyastolic_bp` (sic), `heart_rate`, `respiratory_rate`,
`weight`, `height`, `imc`, `findings text`, `spo2`, `cardiac_rhythm` (`Regular (Sinusal)|Irregular|Arritmia`),
`murmurs` (`Ausentes|Sistólico|Diastólico`), `lung_auscultation text`. **Casi todo varchar** (no numérico).

### paraclinical_exam (EKG)
`id`, `created_at`, `created_by`, `rs`, `p_wave`, `blood_pressure`, `qrs`, `axis`, `qtc`, `ts`, `observations`.

### evolution
`id`, `created_at`, `clinic_history_id bigint`, `patient_id`, `diagnosis`, `treatment`, `sugestive`,
`ekg_diagnosis`, `treatment_plan`, `objective jsonb`, `ekg jsonb`, **`status` (`draft` | `completed`, default `completed`)**,
**`created_by → auth.users`**, `updated_at`. Una evolución `completed` exige `diagnosis` y `treatment_plan`; el borrador no.

### prescriptions
`id`, `created_at`, `updated_at`, `patient_id`, `medication_id`, `presentation_id`,
`medication_snapshot jsonb` (debe incluir `name`, `dose`, `unit`, `form`), `custom_frequency`, `custom_duration`,
`custom_instructions`, `quantity_amount`, `quantity_unit`, `is_active`, `discontinued_at`, `discontinued_reason`,
`clinic_history_id` (receta de primera consulta), `evolution_id` (receta de seguimiento), `prescription_group_id`,
`drugs text[]`, `status` (`Activa` | `Firmada` | `Anulada`), `issued_at date`, `diagnosis`, `diagnosis_code` (CIE-10) y los datos de firma:
`signed_at`, `signed_by`, `signed_pdf_path`, `signed_pdf_sha256`, `signer_subject`. **Con `signed_at` la receta es inmutable** (RLS): no se edita ni se
elimina; solo se puede anular (`status = 'Anulada'` + `discontinued_reason`).

### citas
`id`, `created_at`, `patient_id` (NOT NULL), `date date`, `time time`, `type text`, `status` (default `'Pendiente'`;
`Pendiente|Confirmada|Cancelada|Atendida`), `notes`. No tiene duración ni médico: la agenda asume bloques de 30 min y un solo médico.
**Un horario no se puede reservar dos veces:** el trigger `citas_prevent_double_booking` toma un bloqueo (`pg_advisory_xact_lock`) por
(fecha, hora) y rechaza con `23505` si ya hay otra cita no cancelada; así dos personas que hacen clic a la vez no pueden duplicar el turno.
Solo se valida al crear, mover o reactivar una cita (los duplicados históricos no se tocan).

### medications / medication_categories / medication_presentations
Catálogo. `medications`: `name`, `generic_name`, `category_id`, `requires_monitoring`, `notes`, `warnings`, `active`.
`medication_presentations`: `medication_id`, `dose`, `unit`, `form`, `route`, `common_frequency`,
`standard_instructions`, `available`, `manufacturer`, `price`. Vista: `v_medications_with_category` (`security_invoker`).

### medical_files
`patient_id`, `evolution_id`, `filepath`, `filename`, `filetype` (`prescription|echocardiogram|holter|lab|ecg|xray|other`),
`filesize`, `uploaded_at`, `accessed_count`, `last_accessed_at`, `deleted_at`.

### notifications_log
Registro de notificaciones **enviadas** a pacientes (`channel`: `email|whatsapp|both`). No es una bandeja de notificaciones in-app.

### doctor_signing_certificate
Certificado de firma electrónica del médico (`.p12`), **cifrado con AES-256-GCM** usando `SIGNING_ENCRYPTION_KEY` (solo en el servidor).
Guarda además asunto, emisor, vigencia y huella SHA-256. **La contraseña del certificado no se guarda**: se pide cada vez que se firma.
Solo el médico lo ve y edita (RLS). Bucket privado `signed-prescriptions` (`{patient_id}/{group_id}.pdf`): inmutable, sin update/delete.

### doctor_profile / doctor_secretaries
`doctor_profile`: `id` (= auth user), `full_name`, `email`, `specialty`, `license`, `phone`, `address`, `city`, `identification`, `active`.
`doctor_secretaries (doctor_id, secretary_id)`.

## Seguridad (RLS)

Roles lógicos: **médico** (`auth.uid() = patient.doctor_profile_id`), **secretaria** (fila en `doctor_secretaries`),
**paciente** (`patient.user_id = auth.uid()`). `anon` no tiene acceso a las tablas clínicas.

| Tabla | Médico | Secretaria | Paciente (portal) |
|---|---|---|---|
| `patient` | CRUD de los suyos | leer/crear/editar | leer el suyo |
| `clinic_history` | todo; **solo él** puede completar | crear y editar **borradores** | leer solo `completed` |
| `antecedents`, `physical_exam`, `paraclinical_exam` | según su historia | solo mientras es borrador | leer si la historia es `completed` |
| `evolution` | todo; **solo él** completa | crear y editar **borradores** (borra solo los suyos) | leer solo `completed` |
| `prescriptions` | crear / editar / eliminar | solo leer | leer solo las **firmadas** |
| `citas` | todas las de sus pacientes | crear / editar / cancelar | ver las suyas, solicitar (Pendiente), reagendar o cancelar |
| `medications`, `medication_categories`, `medication_presentations` | crear / editar / eliminar | solo leer | **sin acceso** |
| `doctor_profile` | editar el propio | leer | leer |
| `doctor_secretaries` | gestiona sus secretarias | leer la propia | — |

## Portal del paciente y equipo

- `patient.user_id` (FK `ON DELETE SET NULL`, único) vincula al paciente con su cuenta de Auth. El personal crea la cuenta desde la ficha
  (`grantPortalAccess`: contraseña temporal que se muestra una vez; usa `SUPABASE_SERVICE_ROLE_KEY`). El paciente entra a `/portal`.
- Las secretarias las crea el médico en Ajustes (`src/actions/team.ts`) y se vinculan en `doctor_secretaries`.
- `busy_slots(p_date, p_exclude)` (SECURITY DEFINER) devuelve solo las horas ocupadas, para que el paciente no pueda leer citas ajenas.
- `verify_prescription(p_group_id)` (SECURITY DEFINER, accesible a `anon`) alimenta la página pública `/verificar/[groupId]` del QR de la receta:
  solo expone médico, fechas, estado, iniciales del paciente y la huella SHA-256.

**Sin endurecer todavía** (abiertas a cualquier usuario autenticado):
`medical_files`, `notifications_log`.

Funciones auxiliares (`SECURITY INVOKER`, `search_path = ''`): `can_manage_doctor`, `can_manage_patient`,
`is_patient_doctor`, `is_own_patient`, `is_doctor`, `is_staff`.

## RPC

`save_clinic_history(p_patient_id, p_status, p_date, p_reason, p_diagnosis, p_treatment_plan, p_antecedents jsonb,
p_physical_exam jsonb, p_paraclinical_exam jsonb, p_clinic_history_id default null) → bigint`
Crea o actualiza (borrador o completa) la historia y sus tres exámenes en **una transacción**.
Se invoca desde la Server Action `src/actions/save-clinic-history.ts`.

`delete_clinic_history(p_id bigint)` elimina la historia y sus tres exámenes en una transacción. **Se niega si la historia
tiene evoluciones** (la FK `evolution.clinic_history_id` es `ON DELETE CASCADE` y las borraría) y falla si hay recetas.
Solo el médico elimina cualquier historia; la secretaria solo los borradores que ella creó. Acción: `src/actions/delete-clinic-history.ts`.

`save_medication(p_id, p_medication jsonb, p_presentations jsonb) → uuid` crea o edita un medicamento y sincroniza sus
presentaciones. Las quitadas se eliminan; si ya se recetaron, quedan `available = false`. `delete_medication(p_id)` lo
elimina con sus presentaciones y se revierte si ya fue recetado.

`save_prescription(p_patient_id, p_group_id, p_lines jsonb, p_clinic_history_id, p_evolution_id) → uuid` emite o reemplaza una
receta. **Una receta = varias filas de `prescriptions` con el mismo `prescription_group_id`** (una por medicamento). Al
editar conserva la fecha de emisión y el vínculo clínico. Solo el médico del paciente.
`medication_snapshot` guarda una copia (nombre, dosis, forma, vía, indicación estándar, advertencias) armada en el servidor
desde el catálogo, así la receta no cambia si luego se edita el medicamento.

## Seguridad de la cuenta (verificación en dos pasos)

Supabase Auth MFA (TOTP: Google Authenticator / Microsoft Authenticator). `src/proxy.ts` exige el código en cada petición si la cuenta
tiene un factor verificado y la sesión aún es AAL1; `DashboardShell` no deja entrar al personal (médico y secretarias) hasta que lo active.
Firmar una receta o guardar el certificado exige además una sesión AAL2 y, para firmar, un código vigente en ese momento.
(Requiere TOTP habilitado en Supabase → Authentication → Multi-Factor.)

## PDF de receta

`GET /api/pdf/prescription/{groupId}` (inline) o `?download=1` (adjunto). Genera A4 horizontal con **Receta** e **Indicaciones**
lado a lado, con datos de `doctor_profile` (editables en `/dashboard/settings`), la próxima cita del paciente y el logo/marca de agua
`public/heart.png`. Incluye lo que pide la norma (AM 0031-2020, ACESS-2023-0030): nombre **genérico (DCI)** primero, edad, diagnóstico (CIE-10),
ciudad y fecha DD/MM/AAAA, forma, vía, cantidad en **números y letras**, registro profesional y firma (manuscrita o electrónica).
Si está firmada se entrega el PDF firmado guardado (PAdES); si se anula, una copia marcada "ANULADA" (`?original=1` da el PDF firmado). Requiere sesión y respeta la RLS (el personal del paciente o el propio paciente).

## Diseño (Stitch) → base de datos

Referencias en `design-reference/` (`historia-clinica.html|png`, `dashboard-medico.html|png`).

### Historia clínica

| Elemento del diseño | Fuente | Estado |
|---|---|---|
| Nombre, cédula, edad/fecha de nacimiento, tipo de sangre | `patient.names/lastnames/identification/birthdate/blood_type` | ✅ |
| Badge "Estable" | `patient.status` | ✅ (valores posibles sin verificar) |
| "Últ. visita" | calculado: máx(`clinic_history.date`, `evolution.created_at`) | ✅ derivado |
| Tensión arterial `130/85` | `physical_exam.systolic_bp` + `dyastolic_bp` (dos columnas) | ✅ |
| Frecuencia cardíaca / Peso | `heart_rate` / `weight` | ✅ |
| Saturación O2 | `physical_exam.spo2` | ✅ |
| Ritmo cardíaco, Soplos | `physical_exam.cardiac_rhythm`, `murmurs` | ✅ |
| Hallazgos cardiovasculares | `physical_exam.findings` | ✅ |
| Auscultación pulmonar | `physical_exam.lung_auscultation` | ✅ |
| Pestaña Exámenes Paraclínicos | `paraclinical_exam` (EKG) | ✅ |
| Pestaña Antecedentes | `antecedents` | ✅ |
| Pestaña Evolución Clínica | `evolution` | ⏳ módulo pendiente |
| "Guardar HCE" | `saveClinicHistory` (borrador / completa) | ✅ |
| *(no aparece en el diseño)* motivo, enfermedad actual, diagnóstico, plan de tratamiento, fecha | `clinic_history`, `antecedents.current_disease` | ⚠️ obligatorios en BD; hay que ubicarlos |
| *(no aparece en el diseño)* frecuencia respiratoria, talla, IMC | `physical_exam` | ⚠️ existen en BD y en el formulario actual |

### Dashboard del médico

| Elemento del diseño | Fuente | Estado |
|---|---|---|
| Nombre y especialidad del médico | `doctor_profile.full_name/specialty` | ✅ |
| Fecha de hoy | cálculo en el servidor | ✅ |
| Tabla "Pacientes del Día" | `citas` de hoy + `patient` (`names`, `lastnames`) | ✅ |
| Hora / Motivo | `citas.time` / `citas.type` o `citas.notes` | ⚠️ definir cuál es el "motivo" |
| Estado (Riesgo Alto / Estable / Pendiente) | `patient.risk`, `patient.status`, `citas.status` | ⚠️ mezcla tres campos; valores sin verificar |
| Filtro "Críticos" | `patient.risk = 'Alto'` (supuesto) | ⚠️ |
| Búsqueda de paciente | `patient` por nombre / cédula | ✅ |
| Campana de notificaciones | — (`notifications_log` es de salida, no de entrada) | ❌ sin fuente |
| **Alertas de Riesgo IA** | — | ❌ sin tabla ni módulo (fase futura) |
| Avatar del médico | — | ❌ sin columna; usar iniciales |

### Otros ajustes
- Los diseños traen la navegación en inglés (`Patients`, `Appointments`, `AI Predictions`, `Settings`);
  `DESIGN.md` exige español.
- Sidebar: la historia clínica la dibuja navy y el dashboard blanca; **se decidió blanca** (más contraste).
- Primario: Stitch define `primary #006591` y `primary-container #0ea5e9` (el dashboard usa `#0ea5e9` como primario).

## Cómo regenerar este snapshot
- Tipos: MCP `generate_typescript_types` (o `npx supabase gen types typescript --project-id <id>`), guardado en **UTF-8**.
- Esquema/políticas: MCP `list_tables` (verbose) y `pg_policies`.
