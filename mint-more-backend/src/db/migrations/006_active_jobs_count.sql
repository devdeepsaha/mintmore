-- ── Migration 006: Add active_jobs_count to users ────────────────────────────
-- active_jobs_count tracks currently in-progress assignments.
-- Incremented when a job is assigned, decremented when completed/cancelled.
-- Used by matching engine for workload filtering (NOT jobs_completed_count).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_jobs_count INTEGER NOT NULL DEFAULT 0;

-- Backfill existing users from job_assignments table
UPDATE users u
SET active_jobs_count = (
  SELECT COUNT(*)::INTEGER
  FROM job_assignments ja
  JOIN jobs j ON j.id = ja.job_id
  WHERE ja.freelancer_id = u.id
    AND j.status  IN ('assigned', 'in_progress')
    AND ja.status IN ('pending_acceptance', 'accepted')
)
WHERE u.role = 'freelancer';

-- Ensure it never goes negative
ALTER TABLE users
  ADD CONSTRAINT active_jobs_count_non_negative
  CHECK (active_jobs_count >= 0);