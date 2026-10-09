# Page windows: open in new window and drag out (step 5)

## Contents
- How it works
- Files to add
- Config
- Entry point
- Using it in screens
- Checks

## How it works

```text
List row (@expo/ui)                     Open in New Window button
  modifiers=[pageDragOut({pageId,title})]  onPress -> openPageInNewWindow(pageId, title)
        | SwiftUI .onDrag                       | requestSceneSessionActivation
        v                                       v
  NSItemProvider(NSUserActivity "<bundle id>.page", { pageId, title })
                                |
                                v
  PageWindowsSceneDelegate : ExpoAppSceneDelegate
    page activity  -> creates the window, starts React Native with { pageId }
    anything else  -> super (Expo starts the full app)
                                |
                                v
  index.tsx root: pageId ? <PageWindow pageId/> : <Expo Router App/>
```

A page window remembers its activity for state restoration, so it reopens on the same page after
relaunch. `closePageWindow(pageId)` destroys the window opened for that page; the main window is
never closed this way.

## Files to add

Copy `templates/modules/page-windows/` to `modules/page-windows/`.

| File | Role |
| --- | --- |
| `ios/PageWindowsModule.swift` | `openPage` / `closePageWindow` functions, the `pageDragOut` modifier, and the activity type (`<bundle id>.page`) |
| `ios/PageSceneDelegate.swift` | `PageWindowsSceneDelegate`, the app's scene delegate |
| `app.plugin.js` | Config plugin: full multi-scene manifest with that delegate, and `NSUserActivityTypes` |
| `index.ts` | JS API: `canOpenPageWindows`, `openPageInNewWindow`, `closePageWindow`, `pageDragOut` |
| `ios/PageWindows.podspec`, `expo-module.config.json`, `package.json` | Pod and autolinking metadata |

"Page" means any detail item the app can show on its own. Rename `pageId` to the app's term only
if it helps; keep the Swift, plugin and JS in sync if you do.

## Config

```sh
npx expo install expo-build-properties
```

In `app.json` (or `app.config.*`), `plugins` must list the page-windows plugin **before**
`expo-build-properties`:

```json
"plugins": [
  "expo-router",
  "./modules/page-windows/app.plugin.js",
  ["expo-build-properties", { "ios": { "enableSceneSupport": true } }]
]
```

If the app already uses `expo-build-properties`, add `enableSceneSupport: true` to its existing
`ios` block and move the page-windows plugin above it. Also set `ios.supportsTablet: true` and an
`ios.bundleIdentifier` (the plugin derives the activity type from it). Remove any
`UIApplicationSceneManifest` from `ios.infoPlist`.

Then `npx expo prebuild -p ios --clean` and confirm in `ios/<App>/Info.plist`:
`UIApplicationSupportsMultipleScenes` true, `UISceneDelegateClassName`
`PageWindowsSceneDelegate`, and `NSUserActivityTypes` containing `<bundle id>.page`. The
generated `AppDelegate.swift` should conform to `ExpoReactNativeFactoryProvider`.

## Entry point

Copy `templates/index.tsx` to the app root and set `"main": "./index.tsx"` in `package.json`
(replacing `expo-router/entry`). Fix the `PageWindow` import path to where the app puts
`page-window.tsx`. If the app already has a custom entry, merge: keep `@expo/metro-runtime` the
first import, keep `renderRootComponent(Root)`, and keep the per-root `SplashScreen.hide()`.

`templates/src/components/page-window.tsx` is the page window root. It must not use Expo Router
hooks or `Link`; give it its own `Host` and a Close Window button.

## Using it in screens

- Rows: add `pageDragOut({ pageId, title })` to a list row's `modifiers`
  (`templates/src/components/page-row.tsx`). It is harmless on iPhone.
- Button: render `OpenInNewWindowButton` (`templates/src/components/open-in-new-window-button.tsx`)
  in the detail toolbar. It returns `null` unless `canOpenPageWindows` (iPad).
- `openPageInNewWindow` rejects with `ERR_SINGLE_WINDOW` on devices without multiple scenes.

State shared between windows (stores, caches) works because all windows share one JS runtime.
Per-window UI state must live in components, not module-level singletons.

## Checks

On an iPad simulator:

1. Turn on **Settings → Multitasking & Gestures → Windowed Apps** (or Stage Manager) so windows
   can sit side by side. In full-screen mode a new window replaces the main one; switch in the
   app switcher.
2. Tap Open in New Window: a second window opens on that page, titled with the page title.
3. Both windows respond independently. Close Window closes the page window only.
4. Window → New Window (menu bar / long-press app icon) opens another main window at the start
   tab, not stuck on the splash screen.
5. Long-press a row: the row lifts with the system drag preview. **The drop into a new window
   cannot be automated** (simulator tooling cannot send touch-move events). Ask the user to
   check it by hand: drag the row to the screen edge.
6. On iPhone: no Open in New Window button.
