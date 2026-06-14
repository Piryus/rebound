# Contributing to Rebound

Thanks for your interest! Rebound is a small, focused app — contributions that keep it simple, private, and well-crafted are very welcome.

## Getting set up

See **[docs/RELEASE.md → Development](docs/RELEASE.md#1-development)** for prerequisites and how to run the app on a device.

```bash
npm install
npx expo run:android      # first build
npx expo start --dev-client
```

## Before you open a PR

```bash
npx tsc --noEmit          # type-check (must pass)
npx expo lint             # lint
```

- **TypeScript is strict** — no `any` escape hatches unless genuinely unavoidable (and commented).
- Keep changes focused; one concern per PR.
- Match the existing style. A few conventions worth knowing:
  - **All persistence goes through `src/data/entriesRepository.ts`.** Screens never write SQL directly — that seam is what keeps a future backend sync possible.
  - **The scoring model lives in `src/scoring/`.** Dimensions, weights, and bands are data; change them there, not inline.
  - **Theme tokens live in `src/theme/`.** Use `palette`, `tokens`, and the `Txt` component rather than hard-coded colors/fonts. The app is intentionally a **forced light theme** — don't reach for `useColorScheme()`.
  - Prefer the existing primitives (`Card`, `Button`, `ScoreSlider`, `Icon`, …) before adding new ones.

## Principles

- **Private by default.** No analytics, no accounts, no network calls that send a user's data anywhere. If a feature needs the network, it should be opt-in and transparent.
- **Supportive, never judgemental.** Copy treats hard days as data, not failure.
- **Sub-minute check-in.** Respect the daily ritual — features shouldn't make logging slower.

## Reporting bugs / ideas

Open an issue with steps to reproduce (for bugs) or the problem you're trying to solve (for features). Screenshots help.

By contributing, you agree your contributions are licensed under the project's [MIT license](LICENSE).
