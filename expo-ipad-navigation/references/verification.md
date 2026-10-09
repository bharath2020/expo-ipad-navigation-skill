# Verification

Run these in the target app after all steps. Record what passed and what could not be checked.

## Static checks

```sh
npx tsc --noEmit            # the copied templates must type-check in the app
npx expo-doctor
npx expo prebuild -p ios --clean
plutil -p ios/*/Info.plist | grep -A8 UIApplicationSceneManifest
```

Expect `UIApplicationSupportsMultipleScenes => true`, `UISceneDelegateClassName =>
"PageWindowsSceneDelegate"` and `NSUserActivityTypes` with `<bundle id>.page`.

The skill's own templates can be checked without an app: in the skill's `typecheck/` folder run
`npm install && npm run typecheck`. It copies `templates/` into `typecheck/app/` and runs `tsc`
against the SDK 57 package set.

## Build and run

```sh
xcrun simctl list devices available | grep -E 'iPad|iPhone'
npx expo run:ios --device "<iPad simulator name>"
npx expo run:ios --device "<iPhone simulator name>"
xcrun simctl io booted screenshot ipad-tabs.png
```

## Manual checklist

| # | Device | Check |
| --- | --- | --- |
| 1 | iPad | Floating tab bar at the top; Search is a separate button |
| 2 | iPad | Sidebar button expands the bar into a sidebar with Search first and the sections |
| 3 | iPad | Selecting a section tab shows it and adds it to the bar |
| 4 | iPad | One sidebar button in split-view tabs; Full Screen hides the list |
| 5 | iPad | Search field full width at the top, stays put while typing; recent search fills it |
| 6 | iPad | Open in New Window opens a second window on the page; Close Window closes it only |
| 7 | iPad | Window → New Window opens a main window that leaves the splash screen |
| 8 | iPad | Long-press a row lifts it with a drag preview |
| 9 | iPad (by hand) | Dropping the dragged row at the screen edge opens a new window. Not automatable |
| 10 | iPhone | Bottom tab bar, sections under More, no Full Screen or New Window buttons |
| 11 | iPhone | The tab bar turns into the search field on the Search tab |

Turn on Settings → Multitasking & Gestures → Windowed Apps before checks 6-9.
