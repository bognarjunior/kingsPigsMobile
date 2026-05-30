# Development Environment

State of the tooling on this machine (macOS 14.6.1, Apple Silicon `arm64`).
Audit done on 2026-05-30.

## Current status

| Tool | Version | Status |
|------|---------|--------|
| Node.js | 22.21.0 | ✅ |
| pnpm | 9.15.4 | ✅ |
| npm | 11.7.0 | ✅ |
| Watchman | 2024.12.02 | ✅ |
| Git | 2.39.5 | ✅ |
| EAS CLI | 16.25.0 | ✅ |
| Homebrew | 5.1.0 (`/opt/homebrew`) | ✅ |
| **JDK** | 17.0.13 (Zulu), `JAVA_HOME` set | ✅ |
| **Xcode** | 16.2 | ✅ |
| CocoaPods | 1.16.2 | ✅ |
| **Android SDK** | platform-tools 37, emulator 36.5, API 35 | ✅ (installed 2026-05-30) |
| AVD | `KingsPigs_API35` (Pixel 6, API 35, arm64) | ✅ |

> **Expo CLI:** we use the project-local CLI via `npx expo` / `pnpm expo`.
> The global `expo` (6.0.2) is legacy and **must not** be used.

## Official test targets

The project is validated on **Android and iOS** — both are first-class targets. Every phase
must have its acceptance criteria verified **on both platforms** before being marked complete.

- **Android emulator** — `KingsPigs_API35` (configured in this session).
- **iOS Simulator** — ready via Xcode 16.2 (no extra setup).
- **Physical device** (optional) — Expo Go app + same Wi-Fi network, iOS or Android.

## Android SDK — how it was installed

The `.zprofile` already expected the SDK at `~/Library/Android/sdk`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Steps performed (reproducible):

```bash
# 1. Command-line tools
brew install --cask android-commandlinetools

# 2. Components installed into the SDK root expected by .zprofile
sdkmanager --sdk_root="$HOME/Library/Android/sdk" --licenses
sdkmanager --sdk_root="$HOME/Library/Android/sdk" \
  "platform-tools" "emulator" "platforms;android-35" \
  "build-tools;35.0.0" "system-images;android-35;google_apis;arm64-v8a"

# 3. cmdline-tools inside the SDK root (canonical layout, so avdmanager finds the root)
cp -R /opt/homebrew/share/android-commandlinetools/cmdline-tools/latest \
      "$HOME/Library/Android/sdk/cmdline-tools/latest"

# 4. AVD
avdmanager create avd -n KingsPigs_API35 \
  -k "system-images;android-35;google_apis;arm64-v8a" -d pixel_6
```

> **Detail:** Homebrew's `avdmanager` computes the SDK root from its own location and was
> ignoring `ANDROID_HOME`. That is why `cmdline-tools` was copied into
> `~/Library/Android/sdk` — this makes the SDK self-contained and the tools resolve the
> correct root.

## Running

```bash
# Boot the Android emulator
emulator -avd KingsPigs_API35

# (Phase 1) game in the browser
pnpm --filter game dev

# (Phase 1) game inside the mobile app
pnpm --filter game build      # generates the single-file bundle inside the app
pnpm --filter app start       # 'a' = Android, 'i' = iOS Simulator
```

## Pending / next environment steps

- Migrate from Expo Go to **EAS build** in Phase 7 (native features / stores).
