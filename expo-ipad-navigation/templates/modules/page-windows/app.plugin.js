const { withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = 'PageWindowsSceneDelegate';

/**
 * Turns on multiple window scenes with `PageWindowsSceneDelegate` as the scene delegate, and
 * declares the `<bundle identifier>.page` user activity that carries a page into a new window.
 *
 * SDK 57 gets the scene life cycle from `expo-build-properties` (`ios.enableSceneSupport`), which
 * writes a fixed manifest with one scene and Expo's own delegate, and throws if another manifest
 * is already there. Mods run in reverse order of registration, so list this plugin BEFORE
 * `expo-build-properties` in `app.json`: its mod then runs last and replaces that manifest.
 *
 * Always write the whole manifest. A partial `UIApplicationSceneManifest` drops
 * `UISceneConfigurations`, so no scene delegate is wired up and React Native never starts.
 */
module.exports = function withPageWindows(config) {
  const activityType = `${config.ios?.bundleIdentifier ?? 'app'}.page`;
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;
    plist.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE,
          },
        ],
      },
    };
    const types = Array.isArray(plist.NSUserActivityTypes) ? plist.NSUserActivityTypes : [];
    if (!types.includes(activityType)) {
      plist.NSUserActivityTypes = [...types, activityType];
    }
    return config;
  });
};
