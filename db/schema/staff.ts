import { sql } from "drizzle-orm";
import {
  pgTable, uuid, text, timestamp, time, integer, jsonb, numeric, pgEnum,
  doublePrecision, index, uniqueIndex
} from "drizzle-orm/pg-core";

export const staffStatus = pgEnum("staff_status", ["active", "inactive", "on_leave"]);
export const staffRole   = pgEnum("staff_role",   ["cleaner", "supervisor", "admin", "driver"]);
export const payType     = pgEnum("pay_type",     ["hourly", "per_job", "salary"]);

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull(),

  firstName: text("first_name").notNull(),
  lastName:  text("last_name").notNull(),
  email:     text("email"),
  phone:     text("phone"),
  role:      staffRole("role").default("cleaner").notNull(),
  status:    staffStatus("status").default("active").notNull(),

  defaultShiftStart: time("default_shift_start").default("09:00").notNull(),
  defaultShiftEnd:   time("default_shift_end").default("17:00").notNull(),
  availability:      jsonb("availability").default(sql`'{}'::jsonb`).notNull(),
  holidayAllowanceDays: integer("holiday_allowance_days").default(28).notNull(),
  holidayTakenDays:    integer("holiday_taken_days").default(0).notNull(),
  maxDailyJobs:        integer("max_daily_jobs").default(10).notNull(),

  homeAddress: text("home_address"),
  homeLat:     doublePrecision("home_lat"),
  homeLng:     doublePrecision("home_lng"),
  defaultStartLocation: text("default_start_location"),

  expectedCommuteKm: numeric("expected_commute_km", { precision: 6, scale: 2 }).default("0").notNull(),
  actualMileageKm:   numeric("actual_mileage_km",   { precision: 8, scale: 2 }).default("0").notNull(),
  mileageLastUpdated: timestamp("mileage_last_updated", { withTimezone: true }),

  payType:       payType("pay_type").default("hourly").notNull(),
  hourlyRate:    numeric("hourly_rate", { precision: 8, scale: 2 }),
  perJobRate:    numeric("per_job_rate", { precision: 8, scale: 2 }),
  baseSalary:    numeric("base_salary", { precision: 10, scale: 2 }),
  overtimeRate:  numeric("overtime_rate", { precision: 8, scale: 2 }),
  mileageRate:   numeric("mileage_rate", { precision: 6, scale: 3 }),

  emergencyContactName:  text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  notes:                 text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => {
  return {
    byCompany: index("idx_staff_company").on(t.companyId),
    byStatus:  index("idx_staff_status").on(t.status),
    uniqCompanyEmail: uniqueIndex("uq_staff_company_email").on(t.companyId, t.email),
  };
});
