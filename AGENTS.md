# Notes for agents & contributors

Orientation for anyone (human or AI) making changes in this repo. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and
[docs/RELEASE.md](docs/RELEASE.md) for build/release.

## Stack

Expo **SDK 56**, React Native 0.85, expo-router, expo-sqlite, TypeScript (strict).
APIs move fast — confirm against the **versioned** docs before relying on memory:
<https://docs.expo.dev/versions/v56.0.0/>.

## Map

- `src/app/` — expo-router screens; `(tabs)/` is the tab group, `day/[date].tsx` a modal.
- `src/scoring/` — the six dimensions, the 0–100 composite, and the bands.
- `src/data/entriesRepository.ts` — **the only** place SQL lives. All reads/writes go through it.
- `src/theme/` — `palette`, `tokens`, `brand`. Forced light theme; never `useColorScheme()`.
- `src/components/` — UI primitives (`Card`, `Button`, `ScoreSlider`, `ScoreDial`, `MonthHeatmap`, `TrendChart`, `Icon`, …). The icon set and charts are hand-rolled with `react-native-svg`.

## Conventions

- Type-check before declaring done: `npx tsc --noEmit`.
- Keep persistence behind the repository seam; keep scoring data-driven; reuse theme tokens.
- Private by default — no analytics, accounts, or off-device data.

## Build gotchas

- Native builds want **JDK 17**; set `JAVA_HOME` if your default `java` is newer.
- The RN Gradle plugin runs `node` — ensure the real node binary's dir is on `PATH` for the build shell (version managers like nvm hide it).
- `android/`/`ios/` are generated (CNG) and gitignored — run `npx expo prebuild` to (re)create them.
