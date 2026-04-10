-- Dedupe department casing across contributors + workflows.
-- Run this in the Supabase SQL Editor AFTER the add-company-logo migration.
--
-- Background: early interviews may have saved "Marketing" + "marketing" as
-- separate strings, which makes them appear as two departments in the nav
-- and fragments the department interior page. The app now normalizes on
-- write, but pre-fix rows need a one-time cleanup.
--
-- Strategy: for each (company_id, lower(trim(department))) pair, pick a
-- single canonical value and rewrite all rows to match.
-- Canonical preference: alphabetical min(), which in ASCII orders
-- uppercase before lowercase, so "Marketing" beats "marketing".
--
-- Idempotent: only touches rows where the current value differs from the
-- canonical. Safe to re-run.

-- ─── Diagnostic (run first to see what will change) ───
-- Uncomment to preview the duplicate groups before applying the fix.
--
-- with combined as (
--   select company_id, department from contributors where department is not null and trim(department) <> ''
--   union all
--   select company_id, department from workflows where department is not null and trim(department) <> ''
-- )
-- select
--   company_id,
--   lower(trim(department)) as key,
--   array_agg(distinct trim(department) order by trim(department)) as variants,
--   count(*) as row_count
-- from combined
-- group by company_id, lower(trim(department))
-- having count(distinct trim(department)) > 1;

-- ─── Apply the fix ───
with canonical as (
  select
    company_id,
    lower(trim(department)) as key,
    min(trim(department)) as value
  from (
    select company_id, department from contributors
      where department is not null and trim(department) <> ''
    union all
    select company_id, department from workflows
      where department is not null and trim(department) <> ''
  ) combined
  group by company_id, lower(trim(department))
)
update contributors c
set department = canonical.value
from canonical
where c.company_id = canonical.company_id
  and lower(trim(coalesce(c.department, ''))) = canonical.key
  and c.department is distinct from canonical.value;

with canonical as (
  select
    company_id,
    lower(trim(department)) as key,
    min(trim(department)) as value
  from (
    select company_id, department from contributors
      where department is not null and trim(department) <> ''
    union all
    select company_id, department from workflows
      where department is not null and trim(department) <> ''
  ) combined
  group by company_id, lower(trim(department))
)
update workflows w
set department = canonical.value
from canonical
where w.company_id = canonical.company_id
  and lower(trim(coalesce(w.department, ''))) = canonical.key
  and w.department is distinct from canonical.value;
