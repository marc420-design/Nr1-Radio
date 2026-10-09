# NR1 archive and programme organisation

The archive uses verified source metadata rather than import dates. Filename dates are labelled **Recorded**; original YouTube publication dates are labelled **Published**. Entries without either remain **Date unverified**. The source catalogue covers 285 recordings; 249 original YouTube records were retrieved on 9 October 2026.

The public archive and admin list show one card per recording path while retaining all database IDs and tracklists. Archive listening uses public AzuraCast on-demand downloads; API keys never enter the browser. Starting an archive recording pauses that visitor's radio player.

Rinze, DNA and So-Low sets appear first in the featured section. Sequential date/year playlists place recordings mentioning all three first, then two, then one. Full verified lineups remain visible.

Programme policy starts Saturday 10 October 2026, UK local time:

- Every Saturday and Sunday: **2026 recordings**.
- Weekdays: **2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025**, one year per day, continuing over eight weekdays. Weekends do not advance that cycle.
- Live broadcasting takes priority. The full archive remains an unscheduled fallback.

Year playlists are scheduled on AzuraCast through 9 October 2027. The 62 monthly/undated collections are for organisation, separate from the nine active year playlists. The conflicting legacy timed playlists were disabled. No resident live-show times are invented; add confirmed recurring slots to `schedule` when supplied.

The calendar displays dates, previous/next week navigation, today, 24-hour UK times and midnight-crossing labels. The next-programme countdown computes real Europe/London instants across clock changes. Event dates also use Europe/London.

Run `npm run test:station` and `npx tsc --noEmit` for date provenance, duplicate handling, featured names, eight-weekday rotation, weekend policy, UK midnight and DST checks. The session's full production build was blocked locally by `spawn EPERM`; verify the hosted build before reporting deployment complete.

Operational backups and API verification are kept outside the repository in `../audit-2026-10-09/site-dates/`. Do not run old metadata import scripts that substitute file-upload dates for recording/publication dates. Renew dated radio schedules before October 2027, and review the source catalogue for newly added recordings.
