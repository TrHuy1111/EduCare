## Repo snapshot

This is a React Native (TypeScript) mobile app named `EduCareApp`. The JS/TS entry is `index.js` -> `App.tsx`. Native integration lives under `android/` and `ios/` and uses the community CLI scaffold.

## Big picture / architecture
- Single React Native application with a top-level `App.tsx` that uses `react-native-safe-area-context` and the starter `@react-native/new-app-screen` component.
- Navigation and feature screens are expected under the app root (not present in the scaffold yet). Components live in `components/` (example: `components/CustomInput.tsx`).
- Native bootstrap: Android uses `android/app/src/main/java/com/educareapp/MainApplication.kt` and `MainActivity.kt`. iOS uses `ios/EduCareApp/AppDelegate.swift`. JS bundle entry is `index.js`.
- Firebase and Google Sign-In dependencies are declared at the repo root `package.json` and the RN app `EduCareApp/package.json` (see dependencies `@react-native-firebase/*` and `@react-native-google-signin/google-signin`). Expect native configuration for these services.

## Developer workflows (fast actionable commands)
- Start Metro (PowerShell):
  npm start
- Run on Android (requires Android SDK & emulator or device):
  npm run android
- Run on iOS (macOS only):
  npm run ios
- Install CocoaPods (macOS):
  bundle install; bundle exec pod install
- Run tests (Jest):
  npm test
- Lint (ESLint):
  npm run lint

Notes: `EduCareApp/package.json` sets Node engine >=20 and uses React Native 0.82.1. Use the workspace `package.json` for Firebase versions when linking native modules.

## Project-specific conventions & patterns
- TypeScript with `.tsx` components. Files show small, focused components (see `components/CustomInput.tsx`) that prefer explicit prop typing.
- Vector icons use `react-native-vector-icons/Ionicons` and rely on autolinking for native assets.
- Styling: inline StyleSheet.create objects; simple color tokens and light shadow use.
- Native module linking: Android relies on autolinking but comments in `MainApplication.kt` show where to add manual packages.

## Integration points and external dependencies
- Firebase: `@react-native-firebase/app` and `@react-native-firebase/auth` are in the root `package.json`. Check native Android `google-services.json` and iOS `GoogleService-Info.plist` (not present in scaffold — add under respective platform folders when configuring).
- Google Sign-In: `@react-native-google-signin/google-signin` — requires native config (Client ID, manifest/plist changes).
- Navigation: `@react-navigation/native` and `@react-navigation/native-stack` are present in root `package.json` — look for nav setup (not in scaffold yet).

## Files to inspect for behavior/examples
- `App.tsx` — top-level provider usage (SafeAreaProvider, StatusBar) and entry to app content.
- `index.js` — app registration via `AppRegistry.registerComponent`.
- `components/CustomInput.tsx` — example input component signature and styling conventions.
- `android/app/src/main/java/com/educareapp/MainApplication.kt` — autolinking notes and where to manually add packages.
- `ios/EduCareApp/AppDelegate.swift` — bundle URL configuration for DEBUG vs release bundles.

## Helpful examples for code generation
- To add a new screen: create `src/screens/MyScreen.tsx`, export a React component, and register it in your navigation stack (use `@react-navigation/native-stack`). Example component pattern: props typed with `type Props = { ... }`, default props via parameter defaults, StyleSheet.create for styles.
- To wire native Firebase auth: add platform config files, then import `@react-native-firebase/auth` in your JS and call `auth().signInWithEmailAndPassword(...)`.

## What *not* to change automatically
- Don't alter Android `gradle` wrapper files, `gradle.properties`, or iOS Xcode project files unless making a deliberate native dependency change. Those need manual verification in CI or a macOS environment.

## Verification steps after edits
- Run `npm test` to validate Jest tests. Run `npm start` and `npm run android` for a smoke test (Android environment required).

If anything here is unclear or you'd like this expanded with nav patterns, Firebase setup steps, or CI commands, tell me which section to elaborate on.
