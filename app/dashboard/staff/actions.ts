"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";

type NewStaff = {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: "cleaner" | "supervisor" | "admin" | "driver";
  status?: "active" | "inactive" | "on_leave";
  expected_commute_km?: number;
};

async function ensureCompanyIdForUser() {
  const supabase = getServerSupabase();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  // If linked already, reuse
  const { data: uc } = await supabase
    .from("user_companies")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (uc?.company_id) return uc.company_id as string;

  // Try to use the first existing company
  const { data: co } = await supabase
    .from("companies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let companyId = co?.id as string | undefined;

  // If none exists, create a default
  if (!companyId) {
    const { data: created, error: createErr } = await supabase
  .from("companies")
  .insert({ name: "My Company", timezone: "Europe/London", mileage_rate: 0.45 })
  .select("id")
  .single();

if (createErr || !created) {
  console.error("Create company failed:", createErr); // <-- will print the exact RLS/DB error
  throw new Error(createErr?.message ?? "Failed to create default company");
}
    companyId = created.id as string;
  }

  // Link user <-> company
  const { error: linkErr } = await supabase
    .from("user_companies")
    .insert({ user_id: user.id, company_id: companyId, role: "admin" });
  if (linkErr) throw new Error("Failed to link user to company");

  return companyId!;
}

export async function listStaff() {
  const supabase = getServerSupabase();
  const companyId = await ensureCompanyIdForUser();

  const { data, error } = await supabase
    .from("staff")
    .select(
      "id, first_name, last_name, email, phone, role, status, expected_commute_km, home_lat, home_lng, created_at"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createStaff(formData: FormData) {
  const supabase = getServerSupabase();
  const companyId = await ensureCompanyIdForUser();

  const payload: NewStaff = {
    first_name: (formData.get("first_name") as string)?.trim(),
    last_name: (formData.get("last_name") as string)?.trim(),
    email: (formData.get("email") as string)?.trim() || undefined,
    phone: (formData.get("phone") as string)?.trim() || undefined,
    role: (formData.get("role") as NewStaff["role"]) || "cleaner",
    status: (formData.get("status") as NewStaff["status"]) || "active",
    expected_commute_km: Number(formData.get("expected_commute_km") || 0),
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

export async function updateStaffStatus(id: string, status: "active" | "inactive" | "on_leave") {
  const supabase = getServerSupabase();
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

export async function deleteStaff(id: string) {
  const supabase = getServerSupabase();
  const companyId = await ensureCompanyIdForUser();

  const { error } = await supabase.from("staff").delete().eq("id", id).eq("company_id", companyId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/staff");
  return { ok: true };
}
