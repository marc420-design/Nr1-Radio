-- ============================================================
-- NR1 DNB Radio — Schedule Data
-- Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================
-- Edit show_name, dj_name, start_time, end_time to match
-- your real schedule before running.
--
-- day_of_week key:
--   0 = Monday   1 = Tuesday   2 = Wednesday
--   3 = Thursday 4 = Friday    5 = Saturday   6 = Sunday
--
-- show_type options: 'live' | 'replay' | 'guest' | 'special'
-- ============================================================

-- Clear out any placeholder/sample rows first
DELETE FROM schedule WHERE dj_name = 'DJ Example' OR dj_name = 'Another DJ';

-- Insert NR1 shows — edit times and DJ names as needed
INSERT INTO schedule (show_name, dj_name, day_of_week, start_time, end_time, show_type)
VALUES
  -- Wednesday Live Show
  ('NR1 Wednesday Live Show',   'NR1 Crew',  2, '21:00', '23:00', 'live'),

  -- Friday Live Show
  ('NR1 Friday Live Show',      'NR1 Crew',  4, '21:00', '23:00', 'live'),

  -- Add more slots below as needed. Examples:
  -- ('Guest Mix Saturday',     'TBC',       5, '20:00', '22:00', 'guest'),
  -- ('Sunday Replay',           NULL,        6, '14:00', '16:00', 'replay'),
  -- ('NR1 Birthday Bash Special', 'Full Crew', 4, '20:00', '00:00', 'special')
;

-- Verify the inserts
SELECT day_of_week, start_time, end_time, show_name, dj_name, show_type
FROM schedule
ORDER BY day_of_week, start_time;
