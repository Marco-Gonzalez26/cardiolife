-- APLICADA el 2026-10-03 con el MCP de Supabase (migración: physical_exam_vitals_and_systems).
-- Columnas nuevas de physical_exam que pide el diseño de Historia Clínica de Stitch,
-- y actualización de la RPC save_clinic_history para guardarlas.

alter table public.physical_exam
  add column if not exists spo2 varchar,
  add column if not exists cardiac_rhythm varchar,
  add column if not exists murmurs varchar,
  add column if not exists lung_auscultation text;

comment on column public.physical_exam.spo2 is 'Saturación de oxígeno (%)';
comment on column public.physical_exam.cardiac_rhythm is 'Ritmo cardíaco: Regular (Sinusal) | Irregular | Arritmia';
comment on column public.physical_exam.murmurs is 'Soplos: Ausentes | Sistólico | Diastólico';
comment on column public.physical_exam.lung_auscultation is 'Auscultación pulmonar (texto libre)';

create or replace function public.save_clinic_history(
  p_patient_id uuid,
  p_status text,
  p_date timestamptz,
  p_reason text,
  p_diagnosis text,
  p_treatment_plan text,
  p_antecedents jsonb,
  p_physical_exam jsonb,
  p_paraclinical_exam jsonb,
  p_clinic_history_id bigint default null
) returns bigint
language plpgsql security invoker set search_path = ''
as $$
declare
  v_doctor uuid;
  v_ant uuid;
  v_phy uuid;
  v_par uuid;
  v_id bigint;
  a public.antecedents;
  f public.physical_exam;
  c public.paraclinical_exam;
begin
  if p_status not in ('draft','completed') then
    raise exception 'Estado inválido: %', p_status;
  end if;

  select p.doctor_profile_id into v_doctor from public.patient p where p.id = p_patient_id;
  if v_doctor is null then
    raise exception 'Paciente no encontrado o sin acceso';
  end if;
  if p_status = 'completed' and v_doctor <> (select auth.uid()) then
    raise exception 'Solo el médico puede completar la historia clínica';
  end if;

  a := jsonb_populate_record(null::public.antecedents, coalesce(p_antecedents, '{}'::jsonb));
  f := jsonb_populate_record(null::public.physical_exam, coalesce(p_physical_exam, '{}'::jsonb));
  c := jsonb_populate_record(null::public.paraclinical_exam, coalesce(p_paraclinical_exam, '{}'::jsonb));

  if p_clinic_history_id is not null then
    select ch.antecedents_id, ch.physical_exam_id, ch.paraclinical_exam_id
      into v_ant, v_phy, v_par
      from public.clinic_history ch
      where ch.id = p_clinic_history_id and ch.patient_id = p_patient_id;
    if not found then
      raise exception 'Historia clínica no encontrada o sin acceso';
    end if;
  end if;

  if v_ant is null then
    insert into public.antecedents (
      current_disease, hta, diabetes, dyslipidemia, heart_disease, thyroid_disease,
      kidney_disease, gastric_disease, cardiovascular_disease, cardiac, neuropathy, cancer,
      stroke, syncope, surgeries, alergies, covid, cigarette, alcohol, drugs, exercise,
      religion, father, mother
    ) values (
      a.current_disease, a.hta, a.diabetes, a.dyslipidemia, a.heart_disease, a.thyroid_disease,
      a.kidney_disease, a.gastric_disease, a.cardiovascular_disease, a.cardiac, a.neuropathy, a.cancer,
      a.stroke, a.syncope, a.surgeries, a.alergies, a.covid, a.cigarette, a.alcohol, a.drugs, a.exercise,
      a.religion, a.father, a.mother
    ) returning id into v_ant;
  else
    update public.antecedents set
      current_disease = a.current_disease, hta = a.hta, diabetes = a.diabetes,
      dyslipidemia = a.dyslipidemia, heart_disease = a.heart_disease,
      thyroid_disease = a.thyroid_disease, kidney_disease = a.kidney_disease,
      gastric_disease = a.gastric_disease, cardiovascular_disease = a.cardiovascular_disease,
      cardiac = a.cardiac, neuropathy = a.neuropathy, cancer = a.cancer, stroke = a.stroke,
      syncope = a.syncope, surgeries = a.surgeries, alergies = a.alergies, covid = a.covid,
      cigarette = a.cigarette, alcohol = a.alcohol, drugs = a.drugs, exercise = a.exercise,
      religion = a.religion, father = a.father, mother = a.mother
    where id = v_ant;
    if not found then raise exception 'Sin permiso para editar antecedentes'; end if;
  end if;

  if v_phy is null then
    insert into public.physical_exam (
      systolic_bp, dyastolic_bp, heart_rate, respiratory_rate, weight, height, imc, findings,
      spo2, cardiac_rhythm, murmurs, lung_auscultation
    ) values (
      f.systolic_bp, f.dyastolic_bp, f.heart_rate, f.respiratory_rate, f.weight, f.height, f.imc, f.findings,
      f.spo2, f.cardiac_rhythm, f.murmurs, f.lung_auscultation
    ) returning id into v_phy;
  else
    update public.physical_exam set
      systolic_bp = f.systolic_bp, dyastolic_bp = f.dyastolic_bp, heart_rate = f.heart_rate,
      respiratory_rate = f.respiratory_rate, weight = f.weight, height = f.height,
      imc = f.imc, findings = f.findings,
      spo2 = f.spo2, cardiac_rhythm = f.cardiac_rhythm, murmurs = f.murmurs,
      lung_auscultation = f.lung_auscultation
    where id = v_phy;
    if not found then raise exception 'Sin permiso para editar el examen físico'; end if;
  end if;

  if v_par is null then
    insert into public.paraclinical_exam (
      rs, p_wave, blood_pressure, qrs, axis, qtc, ts, observations
    ) values (
      c.rs, c.p_wave, c.blood_pressure, c.qrs, c.axis, c.qtc, c.ts, c.observations
    ) returning id into v_par;
  else
    update public.paraclinical_exam set
      rs = c.rs, p_wave = c.p_wave, blood_pressure = c.blood_pressure, qrs = c.qrs,
      axis = c.axis, qtc = c.qtc, ts = c.ts, observations = c.observations
    where id = v_par;
    if not found then raise exception 'Sin permiso para editar el examen paraclínico'; end if;
  end if;

  if p_clinic_history_id is null then
    insert into public.clinic_history (
      patient_id, doctor_profile_id, date, reason, diagnosis, treatment_plan, status,
      antecedents_id, physical_exam_id, paraclinical_exam_id
    ) values (
      p_patient_id, v_doctor, coalesce(p_date, now()), p_reason, p_diagnosis, p_treatment_plan,
      p_status, v_ant, v_phy, v_par
    ) returning id into v_id;
  else
    update public.clinic_history set
      date = coalesce(p_date, date), reason = p_reason, diagnosis = p_diagnosis,
      treatment_plan = p_treatment_plan, status = p_status,
      antecedents_id = v_ant, physical_exam_id = v_phy, paraclinical_exam_id = v_par
    where id = p_clinic_history_id
    returning id into v_id;
    if v_id is null then raise exception 'Sin permiso para editar la historia clínica'; end if;
  end if;

  return v_id;
end;
$$;
