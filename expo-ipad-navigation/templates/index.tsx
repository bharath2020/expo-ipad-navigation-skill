// Custom entry point. Point `main` in package.json at this file.
// `@expo/metro-runtime` must be the first import so Fast Refresh works.
import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { PageWindow } from './src/components/page-window';

/**
 * Every iPad window runs this root. The main window shows the full Expo Router app. A window
 * opened for a single page gets `pageId` as an initial prop from the native scene delegate
 * (`modules/page-windows`) and shows only that page, without a second Expo Router root: Expo
 * Router keeps module-level singletons (navigation ref, imperative router, linking) that two
 * roots would fight over.
 */
function Root({ pageId }: { pageId?: string }) {
  // Each window gets its own splash overlay, but Expo Router hides only the first window's. Every
  // root hides its own, so a page window or a second main window (Window > New Window) shows up.
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return pageId ? <PageWindow pageId={pageId} /> : <App />;
}

renderRootComponent(Root);
