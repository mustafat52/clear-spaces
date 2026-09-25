import { supabase } from "./supabase";

/* ---------- availability ---------- */

export async function fetchTakenSlots(fromDate, toDate) {
  const { data, error } = await supabase.rpc("get_taken_slots", {
    from_date: fromDate,
    to_date: toDate,
  });
  if (error) throw error;
  return data || [];
}

/* ---------- bookings ---------- */

export async function createSessionRequest({
  patientId,
  type,
  sessionDate,
  timeSlot,
  amount,
  txnRef,
  clientNotes,
}) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      patient_id: patientId,
      type,
      session_date: sessionDate,
      time_slot: timeSlot,
      amount,
      txn_ref: txnRef || null,
      client_notes: clientNotes || null,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMySessions(patientId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

/* ---------- staff: requests ---------- */

export async function fetchAllSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, patient:patient_id(full_name, phone, email)")
    .order("session_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateSessionStatus(sessionId, status) {
  const { error } = await supabase
    .from("sessions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function updateSharedNotes(sessionId, sharedNotes) {
  const { error } = await supabase
    .from("sessions")
    .update({ shared_notes: sharedNotes, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

/* ---------- staff: clinical notes (separate table, separate RLS) ---------- */

export async function fetchClinicalNotes(sessionId) {
  const { data, error } = await supabase
    .from("session_clinical_notes")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertClinicalNotes(sessionId, notes, staffId) {
  const { error } = await supabase.from("session_clinical_notes").upsert({
    session_id: sessionId,
    clinical_notes: notes,
    updated_by: staffId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/* ---------- staff: availability ---------- */

export async function fetchBlockedSlots(fromDate, toDate) {
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .gte("block_date", fromDate)
    .lte("block_date", toDate);
  if (error) throw error;
  return data || [];
}

export async function addBlockedSlot(blockDate, timeSlot, staffId) {
  const { error } = await supabase
    .from("blocked_slots")
    .insert({ block_date: blockDate, time_slot: timeSlot, created_by: staffId });
  if (error) throw error;
}

export async function removeBlockedSlot(blockDate, timeSlot) {
  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("block_date", blockDate)
    .eq("time_slot", timeSlot);
  if (error) throw error;
}

/* ---------- staff: patients ---------- */

export async function fetchPatients() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "patient")
    .order("full_name");
  if (error) throw error;
  return data || [];
}

export async function fetchPatientSessions(patientId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return data || [];
}