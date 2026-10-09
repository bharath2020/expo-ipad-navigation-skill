# Xcode 26 build patch

## Symptom

`npx expo run:ios` fails while compiling `ExpoModulesJSI` with Xcode 26 (Swift 6.2). The error
points at `RuntimeScheduler.h`: its C++ constructors are annotated `SWIFT_RETURNS_RETAINED`,
which Swift 6.2 rejects.

## Fix

Expo fixed it in expo/expo#51040, but only in SDK 58's `expo-modules-jsi`. The template
backports the fix to `expo-modules-jsi@57.1.1`, the version SDK 57 ships:

1. Copy `templates/scripts/patch-expo-modules-jsi.js` to `scripts/` and
   `templates/patches/expo-modules-jsi+57.1.1.patch` to `patches/`.
2. Add to `package.json` scripts (merge with any existing `postinstall` using `&&`):
   `"postinstall": "node scripts/patch-expo-modules-jsi.js"`.
3. `npm install` (or run the script once).

The script resolves `expo-modules-jsi` through `expo-modules-core`, checks the version, and does
nothing if the version differs (it prints a warning) or if the patch is already applied. It uses
the system `patch` tool, so no extra npm package is needed. Do not copy the patch with a tool
that rewrites whitespace; it must stay byte-for-byte.

If the app already uses `patch-package`, the same `.patch` file works there instead.

## Verify

- `grep -c 'static RuntimeScheduler \*create(' node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h`
  prints `1` (path may be nested under `expo-modules-core/node_modules`).
- `npx expo run:ios` builds.

## Remove

When the app moves to an `expo-modules-jsi` that includes the fix (SDK 58+), the script prints
the version warning and does nothing. Delete the script, the patch and the `postinstall` entry.
