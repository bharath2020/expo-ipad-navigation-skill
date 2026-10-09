# expo-ipad-navigation-skill

An agent skill that adds Apple News-style iPad navigation to an existing **Expo SDK 57**
(React Native 0.86) iOS app. Point Claude Code, or another coding agent, at your app and ask
for a sidebar tab bar, a search tab, or multiple windows; the skill gives it the procedure,
ready-to-copy native templates, the known pitfalls, and simulator checks.

## Features

- **Floating top tab bar that expands into a sidebar** with extra sidebar-only sections
  (SwiftUI `TabView` `.sidebarAdaptable` + `TabSection`). Bottom tab bar with More on iPhone.
- **Search as a separate search tab** (`Tab(role: .search)`), shown as its own button beside
  the tab bar.
- **System search field**: one full-width field across the top on iPad that stays put while
  typing; on iPhone the tab bar turns into the field.
- **Open a page in a new iPad window**, from a button or by dragging a list row out of the
  window, with a per-window root so page windows don't fight Expo Router's singletons.
- **Xcode 26 build fix** for SDK 57's `expo-modules-jsi`.

SDK 57 has no Expo API for sections, search-role tabs, opening windows, or per-window initial
props, so the skill ships two small local Expo modules (about 330 lines of Swift) and a config
plugin. Everything else uses `@expo/ui` SwiftUI components.

## What's inside

```
expo-ipad-navigation/
  SKILL.md                 Procedure the agent follows (prerequisites, steps, checks)
  references/              Decision guide, per-feature details, pitfalls, verification, removal
  templates/               Files to copy into the target app, laid out as in the app
    modules/sidebar-tabs/    SidebarTabView, SidebarTab, removeSidebarToggle (Swift + TS)
    modules/page-windows/    Scene delegate, open/close window, drag-out modifier, config plugin
    scripts/, patches/       postinstall backport of expo/expo#51040 for Xcode 26
    index.tsx                Entry point: main window -> Expo Router, page window -> page root
    src/                     Example usage (placeholder data and screens to replace)
  typecheck/               Type-checks the TypeScript templates against the SDK 57 packages
```

## Requirements

- Expo SDK 57 (`expo` 57.0.23 or later; 57.0.27 tested), React Native 0.86, `@expo/ui` 57,
  `expo-router` 57, Continuous Native Generation.
- Xcode 26+ and iPad / iPhone simulators.
- iOS 18+ for the sidebar and sections (iOS 17 falls back to a plain tab bar).

## Install

### Claude Code

Copy the skill folder into your personal skills or a project's skills:

```sh
git clone https://github.com/bharath2020/expo-ipad-navigation-skill.git
# personal (all projects)
cp -R expo-ipad-navigation-skill/expo-ipad-navigation ~/.claude/skills/
# or one project
mkdir -p <your-app>/.claude/skills
cp -R expo-ipad-navigation-skill/expo-ipad-navigation <your-app>/.claude/skills/
```

Then, in your app, ask something like: "Add the iPad sidebar tab bar with a search tab and
open-in-new-window to this app." Claude Code loads the skill from its description, or run it
explicitly with `/expo-ipad-navigation`.

### Other agents

The skill is plain Markdown plus files. For agents that support the `SKILL.md` skill format,
copy the `expo-ipad-navigation` folder into that agent's skills directory (see its docs for the
path). For any other agent, put the folder in your repo
and tell the agent: "Follow `expo-ipad-navigation/SKILL.md`."

## Check the templates

```sh
cd expo-ipad-navigation/typecheck
npm install
npm run typecheck
```

## How it was tested

- The TypeScript templates type-check against `expo@57.0.27`, `@expo/ui@57.0.22` and
  `expo-router@57.0.25` (`typecheck/`).
- A scratch app assembled from `templates/` passed `expo prebuild` (the plugin wrote the full
  multi-scene manifest and the activity type; the reverse plugin order fails with the documented
  error), built with Xcode 26 for the iOS simulator, and launched on an iPad simulator showing
  the sidebar with sections, the search tab and the split view.
- The native modules come from an app where open-in-new-window, Close Window and Window → New
  Window were checked on the iPad simulator. Dropping a dragged row was not automatable there.

## Limitations

- iOS / iPadOS only; `@expo/ui` SwiftUI components don't render on Android or web.
- React Native 0.86 doesn't officially support multiple scenes; all windows share one JS
  runtime.
- Dropping a dragged row into a new window can't be automated on the simulator; check it by
  hand.

## License

[MIT](LICENSE)
