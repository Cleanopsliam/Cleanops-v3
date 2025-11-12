// app/dashboard/staff/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

/* ------------------------------ types ------------------------------ */

type Role = "cleaner" | "supervisor" | "manager" | "admin";
type Status = "active" | "inactive" | "on_leave";
type Segment = "domestic" | "commercial";

type NewStaff = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  role?: Role;
  status?: Status;
  is_driver?: boolean;
  segment?: Segment;
  start_time?: string | null;      // "HH:mm"
  finish_time?: string | null;     // "HH:mm"
  hourly_pay?: number | null;      // numeric(10,2)
  expected_commute_km?: number | null;
  available_days?: number[] | null; // int2[] values 1..7 (Mon..Sun)
};

/* ------------------------------ auth helpers ------------------------------ */

async function getAuthed() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?redirect=/dashboard/staff");
  return { supabase, user };
}

async function ensureCompanyIdForUser(): Promise<string> {
  const { supabase, user } = await getAuthed();

  // already linked?
  const { data: uc } = await supabase
    .from("user_companies")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (uc?.company_id) return uc.company_id as string;

  // try first existing company
  const { data: co } = await supabase
    .from("companies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  let companyId = co?.id as string | undefined;

  // or create
  if (!companyId) {
    const { data: created, error } = await supabase
      .from("companies")
      .insert({ name: "My Company", timezone: "Europe/London", mileage_rate: 0.45 })
      .select("id")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Failed to create company");
    companyId = created.id as string;
  }

  // link user <-> company
  const { error: linkErr } = await supabase
    .from("user_companies")
    .insert({ user_id: user.id, company_id: companyId, role: "admin" });
  if (linkErr) throw new Error(linkErr.message);

  return companyId!;
}

/* ------------------------------ util parsers ------------------------------ */

function toHHMM(v: string | null | undefined): string | null {
  if (!v) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Math.max(0, Math.min(23, Number(m[1])));
  const mi = Math.max(0, Math.min(59, Number(m[2])));
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

function parseDaysField(v: FormDataEntryValue | null): number[] | null {
  const raw = (v as string | undefined)?.trim();
  if (!raw) return null;

  // Accept JSON array or comma list
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw) as unknown[];
      const nums = arr.map(Number).filter(n => Number.isFinite(n) && n >= 1 && n <= 7);
      return nums.length ? nums : null;
    } catch {
      // fall through
    }
  }
  const nums = raw
    .split(",")
    .map(s => Number(s.trim()))
    .filter(n => Number.isFinite(n) && n >= 1 && n <= 7);
  return nums.length ? nums : null;
}

function parseMoney(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseNumber(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ------------------------------ list ------------------------------ */

export async function listStaff() {
  const { supabase } = await getAuthed();
  const companyId = await ensureCompanyIdForUser();

  const { data, error } = await supabase
    .from("staff")
    .select(`
      id, first_name, last_name, email, phone,
      role, status, is_driver, segment,
      start_time, finish_time, hourly_pay, expected_commute_km,
      available_days, created_at
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/* ------------------------------ create ------------------------------ */

export async function createStaff(formData: FormData) {
  const { supabase } = await getAuthed();
  const companyId = await ensureCompanyIdForUser();

  // robust boolean: hidden "false" + checkbox "true" -> last value wins, or just check for "true"
  const is_driver = (formData.get("is_driver") as string) === "true";

  const payload: NewStaff = {
    first_name: (formData.get("first_name") as string)?.trim(),
    last_name: (formData.get("last_name") as string)?.trim(),
    email: ((formData.get("email") as string) || null)?.trim() || null,
    phone: ((formData.get("phone") as string) || null)?.trim() || null,
    role: ((formData.get("role") as string) || "cleaner") as Role,
    status: ((formData.get("status") as string) || "active") as Status,
    is_driver,                                                   // <-- persists driver
    segment: ((formData.get("segment") as string) || "domestic") as Segment,
    start_time: toHHMM(formData.get("start_time") as string | null),
    finish_time: toHHMM(formData.get("finish_time") as string | null),
    hourly_pay: parseMoney(formData.get("hourly_pay")),
    expected_commute_km: parseNumber(formData.get("expected_commute_km")),
    available_days: parseDaysField(formData.get("available_days")),
  };

  if (!payload.first_name || !payload.last_name) {
    return { ok: false, message: "First name and last name are required." };
  }

  const { error } = await supabase.from("staff").insert({
    company_id: companyId,
    ...payload,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/staff");
  return { ok: true };
}

/* ------------------------------ update status ------------------------------ */

export async function updateStaffStatus(
  id: string,
  status: "active" | "inactive" | "on_leave"
) {
  const { supabase } = await getAuthed();
  const companyId = await ensureCompanyIdForUser();

  const { error } = await supabase
    .from("staff")
    .update({ status })
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/staff");
  return { ok: true };
}

/* ------------------------------ delete ------------------------------ */

export async function deleteStaff(id: string) {
  const { supabase } = await getAuthed();
  const companyId = await ensureCompanyIdForUser();

  const { error } = await supabase
    .from("staff")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/staff");
  return { ok: true };
}