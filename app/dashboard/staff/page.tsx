import { listStaff, createStaff, updateStaffStatus, deleteStaff } from "./actions";
import { AddButton } from "@/components/AddButton";

/** ----- VOID WRAPPERS (required by <form action>) ----- */
async function createStaffAction(formData: FormData) {
  "use server";
  await createStaff(formData); // do not return anything
}

function RowActions({ id, status }: { id: string; status: "active" | "inactive" | "on_leave" }) {
  async function setStatus(formData: FormData) {
    "use server";
    const value = formData.get("status") as "active" | "inactive" | "on_leave";
    await updateStaffStatus(id, value); // no return
  }
  async function remove() {
    "use server";
    await deleteStaff(id); // no return
  }
  return (
    <div className="flex gap-2">
      <form action={setStatus} className="flex gap-2">
        <select name="status" defaultValue={status} className="input !py-1 !px-2">
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
  );
}

function NewStaffForm() {
  return (
    <form action={createStaffAction} className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border p-4">
      <input name="first_name" placeholder="First name" className="input" required />
      <input name="last_name" placeholder="Last name" className="input" required />
      <input name="email" placeholder="Email (optional)" className="input" />
      <input name="phone" placeholder="Phone (optional)" className="input" />
      <select name="role" className="input">
        <option value="cleaner">Cleaner</option>
        <option value="supervisor">Supervisor</option>
        <option value="admin">Admin</option>
        <option value="driver">Driver</option>
      </select>
      <select name="status" className="input">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="on_leave">On leave</option>
      </select>
      <input
        name="expected_commute_km"
        type="number"
        step="0.01"
        min="0"
        placeholder="Expected commute (km)"
        className="input md:col-span-2"
      />
      <div className="md:col-span-1 flex items-center justify-end">
        <AddButton />
      </div>
    </form>
  );
}

export default async function StaffingPage() {
  const staff = await listStaff();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Staffing</h1>
        <p className="text-sm text-black/60">Manage staff profiles, status, and expected commute distance.</p>
      </header>

      <NewStaffForm />

      <div className="rounded-2xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Expected commute (km)</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-black/60">
                  No staff yet — add your first team member above.
                </td>
              </tr>
            )}
            {staff.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.first_name} {s.last_name}</td>
                <td className="px-3 py-2">{s.email || "—"}</td>
                <td className="px-3 py-2">{s.phone || "—"}</td>
                <td className="px-3 py-2 text-center">{s.role}</td>
                <td className="px-3 py-2 text-center">{s.status}</td>
                <td className="px-3 py-2 text-right">{s.expected_commute_km?.toString() ?? "0.00"}</td>
                <td className="px-3 py-2">
                  <RowActions id={s.id} status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
