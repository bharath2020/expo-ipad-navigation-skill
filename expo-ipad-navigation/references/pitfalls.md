# Pitfalls

Each entry: symptom, cause, fix.

## Prebuild throws "UIApplicationSceneManifest is already declared"

`expo prebuild` fails with
``[ios.infoPlist]: withIosInfoPlistBaseMod: `ios.enableSceneSupport` cannot enable scene support because UIApplicationSceneManifest is already declared by the app.``

Cause: the page-windows plugin is listed after `expo-build-properties`, or `app.json`
`ios.infoPlist` declares a scene manifest. Mods run in reverse order of registration, so the
plugin listed later runs first and `enableSceneSupport` then sees its manifest.

Fix: list `./modules/page-windows/app.plugin.js` **before** `expo-build-properties`, and remove
`UIApplicationSceneManifest` from `ios.infoPlist`.

## Blank app / React Native never starts after adding a scene manifest

Cause: a partial `UIApplicationSceneManifest` (for example only
`UIApplicationSupportsMultipleScenes: true`). `ios.infoPlist` is shallow-merged, so
`UISceneConfigurations` disappears, no scene delegate is wired up, and React Native never starts.

Fix: let the plugin write the whole manifest. Never hand-write part of it.

## Crash on launch: `ExpoAppSceneDelegate` fatalError

Cause: the scene delegate is set but `enableSceneSupport` is off, so the SDK 57 AppDelegate is
not an `ExpoReactNativeFactoryProvider`.

Fix: keep `expo-build-properties` `ios.enableSceneSupport: true` (needs `expo >= 57.0.23`).

## Page window shows the main app, or navigation breaks after closing a window

Cause: the page window renders the Expo Router `App`. Expo Router's navigation ref, imperative
`router`, initial URL and `url` listener are module-level singletons shared by every window. A
second root triggers "multiple navigation containers consuming the shared imperative routing
queue", resets `router` to an unbound one when either window unmounts, opens at the cold-start
URL, and makes deep links navigate every window.

Fix: the custom `index.tsx` renders `<PageWindow pageId />` for page windows. Keep page windows
free of Expo Router hooks and `Link`.

## A new window is stuck on the splash screen

Cause: every window gets its own splash overlay, but Expo Router hides only the first window's.

Fix: each root calls `SplashScreen.hide()` in an effect (template `index.tsx`).

## The window opens but shows the main app instead of the page

Cause: the activity type in `NSUserActivityTypes` does not match the one Swift creates, so iPadOS
does not hand the activity to the new scene; or `bundleIdentifier` changed without a fresh
prebuild.

Fix: the plugin derives `<bundle id>.page` from `ios.bundleIdentifier` and Swift uses
`Bundle.main.bundleIdentifier + ".page"`. Run `npx expo prebuild -p ios --clean` after changing
the bundle identifier.

## Second window does not appear on the simulator

Cause: the simulator is in full-screen multitasking, where a new window replaces the current one.

Fix: Settings → Multitasking & Gestures → Windowed Apps (or Stage Manager), or check the app
switcher.

## Drag-out "works" in an automated run

The simulator tooling cannot send touch-move events, so an agent can only verify the long-press
lift. Never report the drop as verified; ask the user to drag a row to the screen edge by hand.

## iPad-only controls on iPhone

Full Screen and Open in New Window make no sense on iPhone (one column, one window). Gate them on
the device idiom (`Platform.isPad`, `canOpenPageWindows`), not on window width: an iPad window in
Split View is compact but can still go full screen and open windows.

## Two sidebar buttons on iPad

Cause: each `NavigationSplitView` adds its own sidebar toggle next to the tab view's.

Fix: wrap the split view's sidebar content in `Group` with `removeSidebarToggle()`.

## Search field placement is wrong on iPad

- Field jumps into the navigation bar when focused: `searchPresentationToolbarBehavior` is
  missing (needs iOS 17.1+); the module applies `.avoidHidingContent`.
- Field is small and trailing instead of full width: placement is `.automatic`; the module uses
  `.navigationBarDrawer(displayMode: .always)` on iPad.
- A title or toolbar items appear above the field: give the search root an empty
  `navigationTitle` on iPad and no toolbar items.
- No field at all: the search tab's content has no `NavigationStack`, or `searchPrompt` is unset.

## Sidebar-only tabs missing

On iOS 17 there is no sidebar style; only main tabs show. On iOS 18+ check that each section tab
has a `section` string and that tabs have unique `value`s.

## Build fails in `ExpoModulesJSI` on Xcode 26

See [xcode26-patch.md](xcode26-patch.md). If `npm install` ran with `--ignore-scripts`, run
`node scripts/patch-expo-modules-jsi.js` by hand.

## `useWindowDimensions` reports the wrong window

All windows share one JS runtime; `useWindowDimensions` reports the key window's size. Lay out
with SwiftUI (`@expo/ui`) or `onLayout` per window instead.
