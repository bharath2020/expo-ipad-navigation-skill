# Decision guide: what is pure Expo and what is custom native

## Contents
- Pure Expo vs custom native
- Why each custom piece exists
- Alternatives that do not work on SDK 57
- Size

## Pure Expo vs custom native

| Piece | Implementation |
| --- | --- |
| List / detail split inside each tab | `@expo/ui` `NavigationSplitView` (pure Expo) |
| Toolbars, titles, lists, buttons, empty states | `@expo/ui/swift-ui` (pure Expo) |
| Search results page, push to a result | `@expo/ui` `NavigationStack` + `NavigationLink` + `NavigationDestination` (pure Expo) |
| Floating tab bar → sidebar with sections | **Custom:** `modules/sidebar-tabs` |
| Search as a separate search-role tab | **Custom:** `modules/sidebar-tabs` (`role="search"`) |
| System search field on the search tab | **Custom:** `modules/sidebar-tabs` (`searchPrompt`) |
| Removing a split view's own sidebar button | **Custom:** `removeSidebarToggle` modifier in `modules/sidebar-tabs` |
| Scene life cycle | `expo-build-properties` `ios.enableSceneSupport` (first-party, needs `expo >= 57.0.23`) |
| Multiple scenes + custom scene delegate | **Custom:** `modules/page-windows/app.plugin.js` |
| Opening / closing a window, drag a row out | **Custom:** `modules/page-windows` |
| Per-window root (page window vs main app) | Custom JS entry `index.tsx` (no native code) |
| Xcode 26 build | **Patch:** backport of expo/expo#51040 to `expo-modules-jsi@57.1.1` |

## Why each custom piece exists

SDK 57 lacks these APIs:

- **No `TabSection`.** Expo Router 57's `NativeTabs` (`expo-router/unstable-native-tabs`) has
  `sidebarAdaptable`, and `@expo/ui` has a `TabView`, but both are flat. Neither can put tabs in
  sidebar-only sections. `SidebarTabView` wraps SwiftUI `TabView(selection:)` with
  `.tabViewStyle(.sidebarAdaptable)`, groups children by their `section` prop into `TabSection`s,
  and hides those from the bar with `.defaultVisibility(.hidden, for: .tabBar)`.
- **No search-role tab with `.searchable`.** Neither `@expo/ui` nor Expo Router 57 exposes
  `Tab(role: .search)` or `.searchable` for a custom tab view. The module maps `role="search"`
  to `Tab(role: .search)` and applies `.searchable` to that tab's content.
- **No open-window API.** No Expo API calls `requestSceneSessionActivation` or attaches SwiftUI
  `.onDrag` with an `NSUserActivity`. `modules/page-windows` adds `openPageInNewWindow`,
  `closePageWindow`, and the `pageDragOut` modifier (registered with
  `ViewModifierRegistry.register`, the documented way to add `@expo/ui` modifiers).
- **No per-window initial props.** SDK 57's `ExpoAppSceneDelegate` calls
  `startReactNative(withModuleName:in:launchOptions:)` with no initial props, and has no
  `initialProperties` hook (that arrived after 57, in expo/expo#50997). `PageWindowsSceneDelegate`
  subclasses it and, for a page activity only, overrides `scene(_:willConnectTo:options:)`
  without calling `super`: it creates the window and calls
  `startReactNative(withModuleName:in:initialProperties:launchOptions:)` with `{ pageId }` on the
  app delegate's factory (`ExpoReactNativeFactoryProvider`). Other windows call `super`.
- **No multi-scene manifest option.** `enableSceneSupport` writes a fixed manifest:
  `UIApplicationSupportsMultipleScenes: false` and Expo's own delegate. The config plugin
  replaces it (see pitfalls for ordering).
- **Xcode 26.** `expo-modules-jsi@57.1.1` does not compile with Swift 6.2. See
  [xcode26-patch.md](xcode26-patch.md).

## Alternatives that do not work on SDK 57

- `expo-router/unstable-split-view`: must be the root navigator. It throws
  `SplitView cannot be used inside another navigator, except for Slot.`, so it cannot sit inside
  a tab. Use `@expo/ui` `NavigationSplitView` per tab.
- A second Expo Router root per window: Expo Router keeps module-level singletons (the
  navigation ref, the imperative `router`, the linking `url` subscription, the initial URL). With
  two roots the imperative router breaks when either window unmounts, deep links navigate every
  window, and a new window opens at the cold-start URL. Render a page-only root instead.
- Setting the scene manifest in `app.json` `ios.infoPlist`: `enableSceneSupport` throws because
  the app already declares a manifest. Without `enableSceneSupport` the SDK 57 AppDelegate is
  not an `ExpoReactNativeFactoryProvider`, and `ExpoAppSceneDelegate` calls `fatalError`.

## Size

Approximate custom native code:

| File | Lines |
| --- | --- |
| `modules/sidebar-tabs/ios/SidebarTabsModule.swift` | ~180 (about 50 of them for the search tab and its field) |
| `modules/page-windows/ios/PageWindowsModule.swift` | ~95 |
| `modules/page-windows/ios/PageSceneDelegate.swift` | ~55 |
| `modules/page-windows/app.plugin.js` | ~40 |
| `scripts/patch-expo-modules-jsi.js` + patch | ~30 + 166 (build fix for an Expo package, not app code) |

About 330 lines of Swift in total. TypeScript wrappers add about 115 lines.

React Native 0.86 does not officially support multiple scenes (its own scene delegate support
came in 0.88, and Expo calls the SDK 57 scene path an opt-in backport), but nothing prevents
them. All windows share one JavaScript runtime and one React Native host; each window is a
separate Fabric surface.
