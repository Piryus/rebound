# Notes for agents & contributors

Orientation for anyone (human or AI) changing this repo. The [README](README.md)
covers what Rebound is and the science behind the score; [CONTRIBUTING.md](CONTRIBUTING.md)
is the contributor guide and [docs/RELEASE.md](docs/RELEASE.md) covers building & publishing.

## Stack

Expo **SDK 56**, React Native 0.85, React 19, expo-router (file-based, **typed routes**
+ React Compiler on), expo-sqlite, TypeScript (strict). **Android-only today** (iOS isn't
wired up). APIs move fast — confirm against the **versioned** docs before relying on memory:
<https://docs.expo.dev/versions/v56.0.0/>.

## Commands

```bash
npm install
npx expo prebuild --platform android   # (re)generate the gitignored android/ project
npx expo run:android                   # first run: build + install dev client + start Metro
npx expo start --dev-client            # day-to-day: start Metro, then press 'a'
npm run lint                           # expo lint (ESLint)
npx tsc --noEmit                       # type-check — this is the gate for "done"
```

There is **no test runner** — correctness is enforced by `tsc --noEmit`, `expo lint`, and
on-device checks. Don't invent an `npm test`. Standalone/release APK builds and Play Store
steps live in [docs/RELEASE.md](docs/RELEASE.md).

## Architecture (the big picture)

**Local-first, one SQLite DB, no network.** Everything below the UI flows through a thin
persistence seam so an optional backend sync can drop in later without touching screens.

- **Persistence seam** — *all* SQL lives in `src/data/`: `db.ts` (schema + migrations),
  `entriesRepository.ts` (daily check-ins), `habitsRepository.ts` (habits). Screens never
  write SQL; they call repo functions, passing the handle from `useSQLiteContext()`.
  `src/data/hooks.ts` wraps the repo in **focus-aware** hooks (`useRangeEntries`,
  `useAllEntries`) that reload on `useFocusEffect`, so screens re-read after edits with no
  manual cache invalidation.
- **Schema & migrations** — `migrateDb` runs as the `SQLiteProvider` `onInit` (root
  `app/_layout.tsx`), in WAL mode, before any screen reads. Migrations are additive
  `if (version === N)` blocks that bump `PRAGMA user_version`. Currently **v2**: `entries`
  (one row per day, upserted by `date`); `habits` + `habit_logs` (a log row = that habit
  done that day; `statusForDate` filters habits by `createdAt` so a past day only shows
  habits that existed then).
- **Scoring pipeline** — data-driven and isolated to `src/scoring/`. `dimensions.ts` defines
  the six dimensions (key, label, accent, weight, `polarity`, and `describe()` value-hints);
  weights sum to 1.0 and `polarity: 'negative'` items (pain, fear) are inverted so higher is
  always better. `score.ts` `computeScore()` rolls them into the 0–100 **Body & Spirit
  Score**, and `getBand()` maps it to one of five supportive bands. To change how scoring
  works, edit only these two files.
- **Reminders** — `prefs/reminder.ts` (AsyncStorage) is the source of truth for enabled/time;
  `notifications/sync.ts` `syncReminder()` reconciles the scheduled **local** notification
  with prefs + OS permission (handling undetermined vs. denied). Call it after changing prefs
  or saving a check-in; never schedule directly.
- **Theme** — forced light theme. Always pull colors/spacing/type from `src/theme/colors` +
  `src/theme/tokens` (+ `brand` for name/greetings). Never hardcode hex or call
  `useColorScheme()`.
- **Hand-rolled visuals** — the icon set (`Icon.tsx`), score dial, month heatmap, and trend
  chart are drawn with `react-native-svg`; there is no icon font or chart library. Touchables
  use `PressableScale` (spring-scale + haptics); its `fill` prop stretches the animated
  wrapper to fill a flex row.

## Conventions & gotchas

- **Type-check before declaring done:** `npx tsc --noEmit`. Keep persistence behind the repo
  seam, scoring data-driven, and reuse theme tokens. Private by default — no analytics,
  accounts, or off-device data.
- **Keyboard (Android edge-to-edge):** SDK 56 doesn't resize the window for the soft keyboard,
  so inputs hide behind it. Use `src/lib/useKeyboardScroll.ts` (`useKeyboardHeight` for bottom
  padding + `useScrollToEnd` for scroll-on-focus); `Screen.tsx` wires this for scroll screens,
  and the root `_layout` blurs the focused input on `keyboardDidHide`.
- **Native builds want JDK 17** (`JAVA_HOME=/opt/homebrew/opt/openjdk@17/...`). The RN Gradle
  plugin shells out to `node`; nvm exposes `node` as a shell *function*, not a PATH binary, so
  a direct `./gradlew` fails with "Cannot run program node". Put the real binary on PATH:
  `export PATH="$(dirname "$(node -e 'console.log(process.execPath)')"):$PATH"`, and
  `./gradlew --stop` if a stale daemon keeps an old env.
- **`android/`/`ios/` are generated (CNG) and gitignored** — `npx expo prebuild` (re)creates
  them; add `--clean` for a from-scratch native rebuild. A standalone `assembleRelease` APK is
  signed with the *debug* key by default, so `adb install -r` updates a sideloaded build in
  place **without wiping on-device data**.
