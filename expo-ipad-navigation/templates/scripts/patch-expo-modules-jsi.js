// Backports expo/expo#51040 to expo-modules-jsi 57.1.1, the version SDK 57 ships. Without it the
// iOS build fails on Xcode 26 (Swift 6.2): `RuntimeScheduler`'s constructors are annotated with
// `SWIFT_RETURNS_RETAINED`, which Swift 6.2 rejects. The fix shipped only in SDK 58's
// expo-modules-jsi. Runs as `postinstall`, and does nothing once the patch is applied.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PATCHED_VERSION = '57.1.1';
const patchFile = path.join(__dirname, '..', 'patches', `expo-modules-jsi+${PATCHED_VERSION}.patch`);
const packageDir = path.dirname(
  require.resolve('expo-modules-jsi/package.json', {
    paths: [path.dirname(require.resolve('expo-modules-core/package.json'))],
  })
);

const { version } = require(path.join(packageDir, 'package.json'));
if (version !== PATCHED_VERSION) {
  console.warn(`expo-modules-jsi is ${version}, not ${PATCHED_VERSION}; not applying ${patchFile}`);
  process.exit(0);
}

const header = path.join(packageDir, 'apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h');
if (fs.readFileSync(header, 'utf8').includes('static RuntimeScheduler *create(')) {
  process.exit(0);
}

execFileSync('patch', ['-p1', '--forward', '-d', packageDir, '-i', patchFile], { stdio: 'inherit' });
