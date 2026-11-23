# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un único consultorio de cardiología privado en Ecuador:

- **El médico (uno solo).** Dueño de los pacientes. Completa historias clínicas, crea evoluciones, emite y firma recetas, edita el catálogo de medicamentos. Su nombre y datos profesionales se editan en su perfil (`doctor_profile`, pantalla de configuración) y no deben quedar fijos en ningún diseño ni texto.
- **Secretaría (1 o 2).** Registra pacientes, guarda historias y evoluciones como borrador, maneja la agenda y solo consulta recetas, evoluciones y catálogo.
- **Pacientes.** Portal de solo lectura: su historia completada, evoluciones, recetas y sus citas.

## Product Purpose

Gestionar el día a día de un consultorio cardiológico: pacientes, historia clínica, evoluciones, recetas con firma electrónica, catálogo de medicamentos y citas, con un portal para que el paciente consulte lo suyo. Éxito: el médico y la secretaría registran y consultan sin fricción, y la receta firmada es verificable por terceros.

## Positioning

Software hecho para un consultorio individual en Ecuador, con sus formatos locales (DD/MM/YYYY, hora de Ecuador, español) y recetas firmadas electrónicamente que cualquiera puede verificar escaneando un QR (`/verificar/[groupId]`).

## Operating Context

- Next.js (App Router) sobre Supabase (base de datos, autenticación y almacenamiento).
- El médico entra con segundo factor (MFA); firmar una receta exige además un código vigente y la contraseña del certificado.
- Las recetas firmadas quedan inmutables; solo se anulan con motivo.
- Los PDFs de receta se generan en el servidor.

## Capabilities and Constraints

- **Un solo médico, sin multi-médico ni multi-tenant.** El nombre del médico debe ser configurable y salir de su perfil.
- Roles verificados en la base de datos: médico, secretaría, paciente (permisos por RLS).
- Formato de fecha DD/MM/YYYY en toda la interfaz.
- **Sin inteligencia artificial hoy.** Las pantallas de IA (predicciones, alertas de riesgo, interacciones) son exploratorias y no tienen fuente de datos.
- Decisión abierta: método de firma electrónica. Hoy se firma en el servidor con un certificado `.p12`; está por confirmar si el certificado del médico es archivo `.p12` o token, y si se usará la aplicación FirmaEC.
- El paciente puede, desde el portal, solicitar una cita, reagendarla (vuelve a "Pendiente" hasta que el consultorio la confirme) y cancelarla. Verificado contra el código (`src/components/portal/`, `src/actions/appointments.ts`).
- Decisión abierta: tratamiento al paciente en los textos (hoy el portal usa "tú"; los diseños de términos usan "usted").

## Brand Commitments

- Nombre: Cardiolife.
- Restricciones visuales que el propietario fijó de forma explícita: color primario `#006591`, acento celeste `#0EA5E9` solo como acento, barra lateral del personal en blanco, todo en español. Referencias en `DESIGN.md` y `design-reference/`.

## Evidence on Hand

- Diseños en el proyecto Stitch "Cardiolife Medical Management System" y capturas en `design-reference/`.
- La base de datos está vacía: no hay pacientes, recetas ni testimonios reales. No hay línea de emergencias propia, acreditaciones ni certificaciones de la clínica. Nada de eso debe inventarse en pantallas ni en textos.
- Número de emergencias de Ecuador: 911.

## Product Principles

1. Un solo médico: la identidad del médico es un dato configurable, nunca texto fijo.
2. Nunca fabricar afirmaciones clínicas, legales o regulatorias (organismos, certificaciones, veredictos automáticos, funciones que no existen).
3. El acto médico es del médico: borradores para la secretaría, firma e inmutabilidad para el médico.
4. Formatos y lenguaje de Ecuador, sin traducciones a medias.
5. Mostrar el dato con su fecha y su fuente antes que una interpretación.
