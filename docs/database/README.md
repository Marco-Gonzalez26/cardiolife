# Migraciones aplicadas

La base de datos de Cardiolife se creó fuera del control de versiones; el historial remoto de Supabase solo
conoce las migraciones aplicadas con el MCP. Este directorio guarda una copia de lo aplicado para referencia.

- `clinic_history_drafts_and_rls_hardening` (2026-10-03): borradores en `clinic_history`, `created_by`, funciones
  auxiliares de RLS, nuevas políticas para `clinic_history`, exámenes, `patient`, `evolution`, `prescriptions`,
  `doctor_profile` y `doctor_secretaries`, RPC `save_clinic_history`, índices en claves foráneas.

- `physical_exam_vitals_and_systems` (2026-10-03): columnas `spo2`, `cardiac_rhythm`, `murmurs`, `lung_auscultation` en
  `physical_exam` y actualización de `save_clinic_history`. SQL en `applied-physical_exam_vitals_and_systems.sql`.

- `citas_rls_and_status` (2026-10-03): `citas.patient_id` NOT NULL, check de estados, índices y políticas nuevas
  (antes la tabla estaba abierta incluso a `anon`).

- `delete_clinic_history_and_exam_policies` (2026-10-03): función `delete_clinic_history` y política de borrado de exámenes
  para los borradores de la secretaria.

- `medication_catalog_rls_and_cleanup` (2026-10-03): `is_doctor()` / `is_staff()`, catálogo de medicamentos solo editable por el
  médico (antes cualquier usuario autenticado), eliminación de 4 categorías duplicadas vacías e índice único por nombre.
- `save_medication_and_prescription_functions` (2026-10-03): `save_medication` y `save_prescription`.
- `delete_medication_function` (2026-10-03): `delete_medication`.

- `citas_prevent_double_booking` (2026-10-03): trigger que impide reservar dos veces el mismo horario (bloqueo por fecha y hora).
- `prescriptions_diagnosis_and_electronic_signature` (2026-10-03): diagnóstico y columnas de firma en `prescriptions`, recetas firmadas
  inmutables, `save_prescription` con diagnóstico, tabla `doctor_signing_certificate` y bucket privado `signed-prescriptions`.

El SQL completo de la migración de borradores se puede recuperar con el MCP (`list_migrations`) o regenerarse con
`supabase db pull`. No se copia aquí para evitar inventar un nombre de archivo que no coincida con el
historial remoto.
