# Removing a feature

Each piece can be removed on its own. Run `npx expo prebuild -p ios --clean` afterwards.

## Page windows

1. Remove `pageDragOut(...)` from row modifiers and the Open in New Window / Close Window
   buttons.
2. Set `"main"` in `package.json` back to `"expo-router/entry"` and delete `index.tsx` and the
   page window root (`page-window.tsx`).
3. Remove `"./modules/page-windows/app.plugin.js"` from `plugins`. Keep `expo-build-properties`
   with `enableSceneSupport` only if something else needs the scene life cycle; otherwise remove
   the option (and the package if unused).
4. Delete `modules/page-windows/`.

## Search field

Drop `searchPrompt`, `onSearchTextChange`, `requestedSearchText` and `searchRequest` from
`SidebarTabView`. The search tab stays, without a system field. To strip the native code too,
delete `TabSearch` and the search props in `SidebarTabsModule.swift` and `index.tsx`.

## Search tab

Remove `role="search"` to make it an ordinary tab, or remove the tab.

## Sidebar tab view

Replace `SidebarTabView` with the app's previous navigator (for example Expo Router `Tabs` or
`NativeTabs` from `expo-router/unstable-native-tabs`, which has `sidebarAdaptable` without
sections), restore the old route files, remove `removeSidebarToggle()` uses, and delete
`modules/sidebar-tabs/`. The search tab and field go with it.

## Xcode 26 patch

Remove after upgrading past `expo-modules-jsi@57.1.1`: delete `scripts/patch-expo-modules-jsi.js`,
`patches/expo-modules-jsi+57.1.1.patch` and the `postinstall` entry. See
[xcode26-patch.md](xcode26-patch.md).

## Upgrading to SDK 58+

SDK 58's template already uses the scene life cycle, and `ExpoAppSceneDelegate` gains an
`initialProperties` hook (expo/expo#50997). There, drop `enableSceneSupport`, put the full scene
manifest in `ios.infoPlist` (or keep the plugin), override `initialProperties` in the scene
delegate instead of `scene(_:willConnectTo:options:)`, and drop the Xcode 26 patch.
