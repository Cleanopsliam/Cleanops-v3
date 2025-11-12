// app/dashboard/staff/page.tsx
import { listStaff, createStaff, updateStaffStatus, deleteStaff } from "./actions";
import { AddButton } from "@/components/AddButton";
import DaysSelect from "@/components//DaysSelect";
import TimePicker from '@/components//TimePicker';

/** ===== small helpers ===== */
function formatKm(v?: number | null) {
  const n = typeof v === "number" ? v : 0;
  return `${n.toFixed(1)} km`;
}
function formatMoney(n?: number | null) {
  const x = typeof n === "number" ? n : 0;
  return `£${x.toFixed(2)}`;
}
const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** required by <form action> — server action wrapper */
async function createStaffAction(formData: FormData) {
  "use server";
  await createStaff(formData);
}

export default async function StaffingPage() {
  const staff = await listStaff();

  const makeUpdateStatusAction = (id: string) =>
    async (formData: FormData) => {
      "use server";
      const value = (formData.get("status") as "active" | "inactive" | "on_leave") ?? "active";
      await updateStaffStatus(id, value);
    };

  const makeDeleteAction = (id: string) =>
    async () => {
      "use server";
      await deleteStaff(id);
    };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Staffing</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage staff profiles, driver status, segment, available days, hours and pay.
        </p>
      </header>

      {/* ======================= CREATE STAFF ======================= */}
      <form
        action={createStaffAction}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border p-4"
        data-staff-form
      >
        {/* Row 1 */}
        <label className="field md:col-span-1">
          <span className="field-label">First name</span>
          <input name="first_name" className="input" required />
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Last name</span>
          <input name="last_name" className="input" required />
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Email (optional)</span>
          <input name="email" className="input" />
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Contact number</span>
          <input name="phone" className="input" />
        </label>

        {/* Row 2 */}
        <label className="field md:col-span-1">
          <span className="field-label">Role</span>
          <select name="role" className="input">
            <option value="cleaner">Cleaner</option>
            <option value="supervisor">Supervisor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {/* ✅ Clean Driver / Non-driver dropdown */}
        <label className="field md:col-span-1">
          <span className="field-label">Driver</span>
          <select name="is_driver" className="input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Segment</span>
          <select name="segment" className="input">
            <option value="domestic">Domestic</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Status</span>
          <select name="status" className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On leave</option>
          </select>
        </label>

        {/* Row 3 — Available days / time / pay / commute */}
        <div className="md:col-span-2">
          {/* Force-remount DaysSelect after a successful add: key changes when staff length changes */}
          <DaysSelect
            key={`days-${staff.length}`}
            name="available_days"
            label="Available days"
          />
        </div>

        {/* ✅ TimePicker (no step prop now) */}
        <label className="field md:col-span-1">
          <TimePicker name="start_time" label="Start time" />
        </label>

        <label className="field md:col-span-1">
          <TimePicker name="finish_time" label="Finish time" />
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Hourly pay (£)</span>
          <input name="hourly_pay" type="number" step="0.01" min="0" className="input" />
        </label>

        <label className="field md:col-span-1">
          <span className="field-label">Expected commute (km)</span>
          <input name="expected_commute_km" type="number" step="0.1" min="0" className="input" />
        </label>

        <div className="md:col-span-4 flex items-center justify-end">
          <AddButton />
        </div>
      </form>

      {/* ======================= TABLE ======================= */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--surface)]">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Driver</th>
              <th className="px-3 py-2">Segment</th>
              <th className="px-3 py-2">Days</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">Finish</th>
              <th className="px-3 py-2 text-right">Hourly pay</th>
              <th className="px-3 py-2 text-right">Commute</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-[var(--muted)]">
                  No staff yet — add your first team member above.
                </td>
              </tr>
            )}

            {staff.map((s: any) => {
              const updateStatus = makeUpdateStatusAction(s.id);
              const remove = makeDeleteAction(s.id);

              const dayChips =
                Array.isArray(s.available_days) && s.available_days.length > 0
                  ? (s.available_days as number[])
                      .map((d) => DAY_ABBR[(d - 1 + 7) % 7]) // 1..7 -> Mon..Sun
                      .map((abbr: string, i: number) => (
                        <span
                          key={`${s.id}-${abbr}-${i}`}
                          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs"
                        >
                          {abbr}
                        </span>
                      ))
                  : "—";

              return (
                <tr key={s.id} className="border-t align-middle">
                  <td className="px-3 py-3">{s.first_name} {s.last_name}</td>
                  <td className="px-3 py-3">{s.email || "—"}</td>
                  <td className="px-3 py-3">{s.phone || "—"}</td>
                  <td className="px-3 py-3 text-center">{s.role ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{s.is_driver ? "Yes" : "No"}</td>
                  <td className="px-3 py-3 text-center">
                    {s.segment ? s.segment[0].toUpperCase() + s.segment.slice(1) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(dayChips) ? dayChips : dayChips}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">{s.status}</td>
                  <td className="px-3 py-3 text-center">{s.start_time || "—"}</td>
                  <td className="px-3 py-3 text-center">{s.finish_time || "—"}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(s.hourly_pay)}</td>
                  <td className="px-4 py-3 text-right">{formatKm(s.expected_commute_km)}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={updateStatus} className="flex items-center gap-2">
                        <select name="status" defaultValue={s.status} className="input !py-1 !px-2">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on_leave">On leave</option>
                        </select>
                        <button className="btn-secondary" type="submit">Update</button>
                      </form>
                      <form action={remove}>
                        <button className="btn-danger" type="submit">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}