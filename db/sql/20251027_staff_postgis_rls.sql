create extension if not exists postgis;

DO $$ BEGIN
  CREATE TYPE staff_status AS ENUM ('active','inactive','on_leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('cleaner','supervisor','admin','driver');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pay_type AS ENUM ('hourly','per_job','salary');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id uuid NOT NULL,

  first_name text NOT NULL,
  last_name  text NOT NULL,
  email      text,
  phone      text,
  role       staff_role NOT NULL DEFAULT 'cleaner',
  status     staff_status NOT NULL DEFAULT 'active',

  default_shift_start time NOT NULL DEFAULT '09:00',
  default_shift_end   time NOT NULL DEFAULT '17:00',
  availability        jsonb NOT NULL DEFAULT '{}'::jsonb,
  holiday_allowance_days int NOT NULL DEFAULT 28,
  holiday_taken_days    int NOT NULL DEFAULT 0,
  max_daily_jobs        int NOT NULL DEFAULT 10,

  home_address text,
  home_lat double precision,
  home_lng double precision,

  home_geog geography(Point,4326)
    GENERATED ALWAYS AS (
      CASE
        WHEN home_lat IS NULL OR home_lng IS NULL THEN NULL
        ELSE ST_SetSRID(ST_MakePoint(home_lng, home_lat), 4326)::geography
      END
    ) STORED,

  default_start_location text,

  expected_commute_km numeric(6,2) NOT NULL DEFAULT 0,
  actual_mileage_km   numeric(8,2) NOT NULL DEFAULT 0,
  mileage_last_updated timestamptz,

  pay_type pay_type NOT NULL DEFAULT 'hourly',
  hourly_rate   numeric(8,2),
  per_job_rate  numeric(8,2),
  base_salary   numeric(10,2),
  overtime_rate numeric(8,2),
  mileage_rate  numeric(6,3),

  emergency_contact_name  text,
  emergency_contact_phone text,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_staff_company ON public.staff(company_id);
CREATE INDEX IF NOT EXISTS idx_staff_status  ON public.staff(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_company_email ON public.staff(company_id, email);
CREATE INDEX IF NOT EXISTS idx_staff_home_geog ON public.staff USING GIST (home_geog);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS set_staff_updated_at ON public.staff;
CREATE TRIGGER set_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.auth_available_company_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT company_id
  FROM public.user_companies
  WHERE user_id = auth.uid()
$fn$;

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY staff_select ON public.staff
  FOR SELECT
  USING (company_id IN (SELECT public.auth_available_company_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY staff_insert ON public.staff
  FOR INSERT
  WITH CHECK (company_id IN (SELECT public.auth_available_company_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY staff_update ON public.staff
  FOR UPDATE
  USING (company_id IN (SELECT public.auth_available_company_ids()))
  WITH CHECK (company_id IN (SELECT public.auth_available_company_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY staff_delete ON public.staff
  FOR DELETE
  USING (company_id IN (SELECT public.auth_available_company_ids()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
