# Sidebar tab view, search tab and search field (steps 2-4)

## Contents
- Files to add
- Wiring the main window
- Sidebar-only sections
- The search tab and its field
- Split views inside tabs
- Checks

## Files to add

Copy `templates/modules/sidebar-tabs/` to `modules/sidebar-tabs/` in the app. Expo autolinks
local modules in `modules/` on the next prebuild; there is nothing to add to `package.json`.

| File | Role |
| --- | --- |
| `ios/SidebarTabsModule.swift` | Registers `SidebarTabView`, `SidebarTab` (`ExpoUIView`) and the `removeSidebarToggle` modifier |
| `ios/SidebarTabs.podspec` | Pod for the module; depends on `ExpoModulesCore` and `ExpoUI` |
| `index.tsx` | Typed React wrappers: `SidebarTabView`, `SidebarTab`, `removeSidebarToggle()` |
| `expo-module.config.json`, `package.json` | Autolinking metadata |

`@expo/ui` and `expo-symbols` (for the `SFSymbol` type) must be installed:
`npx expo install @expo/ui expo-symbols`.

## Wiring the main window

`SidebarTabView` must be the root view of the main window, inside one `@expo/ui` `Host`. With
Expo Router the simplest shape is a single route:

- `src/app/_layout.tsx` renders `<Slot />` (template provided). If the app's root layout is a
  `Stack` or `Tabs`, replace it; the tab view now owns top-level navigation.
- `src/app/index.tsx` renders `<Host style={{ flex: 1 }}><SidebarTabView ...>` (template).

Move each existing top-level tab's screen into a `<SidebarTab>`. Its children must be `@expo/ui`
SwiftUI views (they render inside the `Host`). React Native views need `@expo/ui`'s
`RNHostView` wrapper or a rewrite; check which the app uses before starting.

Selection is controlled: keep it in React state and pass `selection` / `onSelectionChange`.
Mount tabs lazily (the template's `visited` set) so sidebar-only tabs do not all render at launch.

Props: `SidebarTab` takes `value` (unique), `label`, `systemImage` (SF Symbol), optional
`section`, `badge` (number; 0 hides it), and `role` (`'search'`).

## Sidebar-only sections

Tabs without `section` are main tabs: shown in the floating bar and the sidebar. Tabs with a
`section` are grouped under a `TabSection` with that title and appear only in the sidebar; while
one is selected iPadOS adds it to the floating bar, as Apple News does. On iPhone and in
compact-width iPad windows the main tabs sit in a bottom bar and the sections move under More.

Section order follows the first appearance of each section name among the children.

On iOS 17 (no `.sidebarAdaptable`) the view falls back to a plain `TabView` with only the main
tabs; sidebar-only tabs are unreachable there. Give them another entry point if iOS 17 matters.

## The search tab and its field

- Add `<SidebarTab value="search" label="Search" systemImage="magnifyingglass" role="search">`.
  iPadOS shows it as a separate search button beside the floating bar. List it first so the
  sidebar shows Search at the top.
- Pass `searchPrompt` to turn on the system search field for that tab, and
  `onSearchTextChange` to receive the text. The field lives in native state; JS only observes it.
- To set the field's text (tapping a recent search), set `requestedSearchText` and bump
  `searchRequest` (a counter). The native side copies the text whenever the counter changes,
  so the same text can be requested twice.
- iPad: the field uses `.navigationBarDrawer(displayMode: .always)` with
  `searchPresentationToolbarBehavior(.avoidHidingContent)` (iOS 17.1+), so one full-width field
  runs across the top and stays there while typing. iPhone: the default placement, which on
  iOS 26 turns the bottom tab bar into the field. The choice is by device idiom, not size class.
- The search screen must contain a `NavigationStack` (the field attaches to its navigation bar).
  On iPad give the root an empty `navigationTitle` and no toolbar items, so the field is the only
  bar at the top. See `templates/src/screens/search-screen.tsx`.

If the app wants different search behavior, edit `TabSearch` in `SidebarTabsModule.swift`. With
`.automatic` placement on iPad the field sits in the navigation bar's trailing side instead of
full width; without `.avoidHidingContent` it jumps into the bar when focused.

## Split views inside tabs

Use `@expo/ui` `NavigationSplitView` per tab (`templates/src/components/page-split-view.tsx`).
Wrap the sidebar column content in `<Group modifiers={[removeSidebarToggle()]}>` so the tab
view's sidebar button is the only one; otherwise iPad shows two sidebar buttons. Keep
`columnVisibility` and `preferredCompactColumn` controlled so a Full Screen toggle
(`detailOnly`) and narrow windows work.

## Checks

On an iPad simulator (iOS 18+), after `npx expo run:ios --device "<iPad simulator name>"`:

1. The floating tab bar is at the top with the main tabs; Search is a separate button.
2. The bar's sidebar button opens the sidebar: Search first, main tabs, then each section header
   with its tabs. Selecting a section tab shows its content and adds it to the bar.
3. Only one sidebar button is visible in tabs that contain a split view.
4. Search: one full-width field at the top; typing updates results; it stays in place while
   typing; tapping a recent search fills the field.
5. On an iPhone simulator: bottom tab bar, sections under More, and the tab bar turns into the
   search field on the Search tab.

Use `xcrun simctl io booted screenshot <file>.png` to capture evidence.
