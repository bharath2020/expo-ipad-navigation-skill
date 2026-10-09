import { createModifier } from '@expo/ui/swift-ui/modifiers';
import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

type PageWindowsNative = {
  openPage(pageId: string, title: string): Promise<void>;
  closePageWindow(pageId: string): Promise<boolean>;
};

const native = requireNativeModule<PageWindowsNative>('PageWindows');

/** Whether pages can open in their own windows (iPad only). */
export const canOpenPageWindows = Platform.OS === 'ios' && Platform.isPad;

/** Opens the page in a new iPad window. */
export function openPageInNewWindow(pageId: string, title: string): Promise<void> {
  return native.openPage(pageId, title);
}

/**
 * Closes the window that was opened for `pageId` (the page it opened on, even if the user has
 * since moved to another page in it). Never closes the main window.
 */
export function closePageWindow(pageId: string): Promise<boolean> {
  return native.closePageWindow(pageId);
}

/**
 * An `@expo/ui` modifier that lets a row be dragged out of the window to open the page in a new
 * window.
 */
export const pageDragOut = (params: { pageId: string; title: string }) =>
  createModifier('pageDragOut', params);
