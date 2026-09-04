-- ============================================================
-- NR1 DNB Radio - Schedule Data
-- Paste this into: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================
-- day_of_week key:
--   0 = Monday   1 = Tuesday   2 = Wednesday
--   3 = Thursday 4 = Friday    5 = Saturday   6 = Sunday
--
-- show_type options: 'live' | 'replay' | 'guest' | 'special'
-- ============================================================

DELETE FROM schedule;

INSERT INTO schedule (show_name, dj_name, day_of_week, start_time, end_time, show_type)
VALUES
  ('NR1 7 Day All', 'Full NR1 archive rotation', 0, '00:00', '23:59', 'replay'),
  ('NR1 7 Day All', 'Full NR1 archive rotation', 1, '00:00', '23:59', 'replay'),
  ('NR1 7 Day All', 'Full NR1 archive rotation', 2, '00:00', '23:59', 'replay'),
  ('NR1 7 Day All', 'Full NR1 archive rotation', 3, '00:00', '23:59', 'replay'),
  ('NR1 7 Day All', 'Full NR1 archive rotation', 4, '00:00', '23:59', 'replay'),
  ('NR1 New Sets 2026', '2026 uploaded sets block', 5, '01:00', '23:59', 'special'),
  ('NR1 New Sets 2026', '2026 uploaded sets block', 6, '00:00', '22:47', 'special');

SELECT day_of_week, start_time, end_time, show_name, dj_name, show_type
FROM schedule
ORDER BY day_of_week, start_time;
