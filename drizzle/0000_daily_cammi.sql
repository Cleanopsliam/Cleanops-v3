CREATE TYPE "public"."pay_type" AS ENUM('hourly', 'per_job', 'salary');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('cleaner', 'supervisor', 'admin', 'driver');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'inactive', 'on_leave');--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" "staff_role" DEFAULT 'cleaner' NOT NULL,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"default_shift_start" time DEFAULT '09:00' NOT NULL,
	"default_shift_end" time DEFAULT '17:00' NOT NULL,
	"availability" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"holiday_allowance_days" integer DEFAULT 28 NOT NULL,
	"holiday_taken_days" integer DEFAULT 0 NOT NULL,
	"max_daily_jobs" integer DEFAULT 10 NOT NULL,
	"home_address" text,
	"home_lat" double precision,
	"home_lng" double precision,
	"default_start_location" text,
	"expected_commute_km" numeric(6, 2) DEFAULT '0' NOT NULL,
	"actual_mileage_km" numeric(8, 2) DEFAULT '0' NOT NULL,
	"mileage_last_updated" timestamp with time zone,
	"pay_type" "pay_type" DEFAULT 'hourly' NOT NULL,
	"hourly_rate" numeric(8, 2),
	"per_job_rate" numeric(8, 2),
	"base_salary" numeric(10, 2),
	"overtime_rate" numeric(8, 2),
	"mileage_rate" numeric(6, 3),
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "idx_staff_company" ON "staff" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_staff_status" ON "staff" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_staff_company_email" ON "staff" USING btree ("company_id","email");