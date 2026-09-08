# First reliability checkpoint

## Scope

- Approved source baseline: `af8456db615481503556071cccdc3cc14231a9de`.
- Restore branch: `restore/approved-af8456d`.
- Work branch: `preview/reliability-phase1`.
- `index.html`, the item catalogues, `store-tabs.js`, `costco-pictures.js`, and the approved runtime are byte-for-byte preserved. Tests assert their Git blob hashes.
- Core features now load from this deployment, in verified dependency order after DOMContentLoaded. No `document.write` and no externally hosted executable script are used by the new loader.
- Existing third-party product-image URLs remain unchanged. This does not guarantee those images are reachable or correctly branded; image-host verification is separate follow-up work.
- No Favorites, Start Shopping, Buy Often, or Smart Suggestions are enabled.
- Backup export is a separate `backups.html` utility. No main app navigation was added. It only reads an explicit allowlist of app storage keys, exports their exact strings, and makes no storage writes. There is no import/restore tool yet.

## Data safety

The restore branch saves CODE, not the family's saved browser data. Local storage lives under an origin in a particular browser. Preview data is not live-app data. Use `backups.html` on the SAME origin and browser as the app to export its saved information after the utility has been approved and deployed there. This change does not create an off-device or automatic backup. Preserve old keys; never clear localStorage to resolve loading bugs.

## Release gates

1. Run `python -m unittest discover -s tests -v` with the requirements under `tests/`. CI checks Chromium and WebKit separately.
2. Preview the branch using only disposable test data. Confirm both store tabs, 25 Costco essentials, quantities, check-off, custom items, single-meal Shabbos/Yom Tov views, and recipe editing.
3. Have Sam approve the preview. Do not merge solely because a build is green.
4. Confirm the actual production deployment/commit in Vercel before publishing. The connection available during preparation returned 403 for the `aba-staffing-platform/shopping-list` project; production status was not verified.
5. After release, verify the production domain serves the expected `release.json`, browser startup reaches `ShoppingRelease.state === 'ready'`, and the critical flows still work.

## Rollback

A Git branch reset is NOT a verified production rollback. Record the last known-good production deployment ID before release, restore that deployment through Vercel's deployment controls, and verify the production URL afterward. For source changes, prefer a new revert commit instead of repeatedly force-pushing main. Restore no browser data unless explicitly requested and previewed.

## Remaining work (not implemented here)

Preview approval and live deployment verification; restore-from-backup with validation and rollback; safer handling of invalid/unavailable browser storage in the older base app; image availability and custom-photo precedence; store-specific item search; date consistency when switching night/day tabs; Favorites/Undo/item details; household sharing and offline sync. These are separate changes, each requiring its own test and approval.
