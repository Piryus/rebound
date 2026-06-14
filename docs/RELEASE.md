# Building & releasing Rebound

Rebound uses Expo's [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) — the `android/` and `ios/` folders are **not** committed; they're generated from `app.json` + the installed packages with `npx expo prebuild`. This guide covers three levels:

1. [Run it in development](#1-development) (live reload on a device)
2. [Build a release APK for yourself](#2-a-standalone-build-for-yourself) (sideload, no store)
3. [Publish to the Play Store](#3-publishing-to-the-google-play-store)

---

## Prerequisites

| Tool | Notes |
| --- | --- |
| Node 20+ | `node --version` |
| **JDK 17** | Gradle is happiest on 17. If your default `java` is newer, set `JAVA_HOME` to a 17 JDK before any native build. |
| Android SDK + platform-tools | `adb` on your `PATH`; a device with USB debugging, or an emulator |

> **Gotcha (local Gradle builds):** the React Native Gradle plugin shells out to `node`. If `node` is provided by a version manager (nvm/asdf), make sure the **real binary's directory** is on `PATH` for the build shell, e.g. `export PATH="$(dirname "$(command -v node)"):$PATH"`. Otherwise Gradle fails with `Cannot run program "node"`.

```bash
git clone https://github.com/Piryus/rebound.git
cd rebound
npm install
```

---

## 1. Development

The fastest loop — installs a debug dev-client, then serves JS over Metro with fast refresh.

```bash
npx expo run:android          # first time: builds + installs + starts Metro
# subsequent runs:
npx expo start --dev-client   # then press 'a' to open on the device
```

The daily local reminder works in this debug build. (Expo Go is **not** a supported path on SDK 56 for this app — use the dev build.)

---

## 2. A standalone build for yourself

A signed **release APK** you can install on your own phone and keep, no store involved.

### Option A — EAS Build (cloud, recommended)

[EAS](https://docs.expo.dev/build/introduction/) builds in the cloud and manages signing keys for you.

```bash
npm install -g eas-cli
eas login
eas build:configure          # creates eas.json if missing
eas build --platform android --profile preview
```

The `preview` profile produces an installable **APK**. When the build finishes, EAS gives you a URL — open it on the phone (or `eas build:run -p android`) to install.

A minimal `eas.json`:

```json
{
  "build": {
    "preview":    { "android": { "buildType": "apk" } },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

### Option B — Local Gradle (no EAS account)

Generate a release keystore once and keep it **out of git** (`*.jks` is already gitignored):

```bash
keytool -genkeypair -v -keystore rebound-release.jks \
  -alias rebound -keyalg RSA -keysize 2048 -validity 10000
```

Point Gradle at it via `android/gradle.properties` (after `npx expo prebuild`):

```properties
REBOUND_UPLOAD_STORE_FILE=rebound-release.jks
REBOUND_UPLOAD_KEY_ALIAS=rebound
REBOUND_UPLOAD_STORE_PASSWORD=********
REBOUND_UPLOAD_KEY_PASSWORD=********
```

Wire those into the `release` `signingConfig` in `android/app/build.gradle`, then:

```bash
export JAVA_HOME=/path/to/jdk-17
cd android
./gradlew assembleRelease         # → app/build/outputs/apk/release/app-release.apk
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 3. Publishing to the Google Play Store

1. **Bump the version** in `app.json`: raise `expo.version` (e.g. `1.0.1`) and `expo.android.versionCode` (an integer that must increase every upload).
2. **Build an App Bundle (`.aab`)** — Play requires AAB, not APK:
   ```bash
   eas build --platform android --profile production
   ```
3. **Create the app** in the [Play Console](https://play.google.com/console), complete the store listing (icon, screenshots — the ones in `docs/screenshots/` are a good start, feature graphic, description), and the required **Data safety** form. Rebound stores everything **on-device and collects nothing**, which makes that form short and honest.
4. **Upload** the `.aab` to an Internal testing track first, then promote to Production. You can automate uploads with:
   ```bash
   eas submit --platform android --latest
   ```
5. **Notifications:** the daily reminder is a *local* notification, so no Firebase/push setup is required for the store build.

### Store-listing checklist

- [ ] Version + versionCode bumped
- [ ] Adaptive icon & feature graphic
- [ ] 2–8 phone screenshots
- [ ] Short + full description
- [ ] Privacy policy URL (a short page stating "all data is stored locally on your device")
- [ ] Data safety form (no data collected / shared)
- [ ] Content rating questionnaire

---

## iOS (future)

The codebase is cross-platform React Native, but iOS hasn't been wired up or tested yet. When it is: `npx expo prebuild -p ios`, build with `eas build --platform ios`, and submit via `eas submit`. An Apple Developer account is required.

---

## Versioning quick reference

| Where | Field | Rule |
| --- | --- | --- |
| `app.json` | `expo.version` | Human-facing semver, e.g. `1.2.0` |
| `app.json` | `expo.android.versionCode` | Integer, **must increase** every Play upload |
