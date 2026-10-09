import { type CommonViewModifierProps } from '@expo/ui/swift-ui';
import { createModifier, createViewModifierEventListener } from '@expo/ui/swift-ui/modifiers';
import { requireNativeView } from 'expo';
import type { SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import type { NativeSyntheticEvent } from 'react-native';

type NativeSidebarTabViewProps = CommonViewModifierProps & {
  selection: string;
  searchPrompt?: string;
  requestedSearchText?: string;
  searchRequest?: number;
  onSelectionChange: (event: NativeSyntheticEvent<{ selection: string }>) => void;
  onSearchTextChange: (event: NativeSyntheticEvent<{ text: string }>) => void;
  children: ReactNode;
};

const NativeSidebarTabView = requireNativeView<NativeSidebarTabViewProps>(
  'SidebarTabs',
  'SidebarTabView'
);

export type SidebarTabViewProps = CommonViewModifierProps & {
  /** The `value` of the selected tab. */
  selection: string;
  onSelectionChange: (selection: string) => void;
  /**
   * Shows the system search field for the tab with `role="search"`, with this placeholder: below
   * the tab bar on iPad, at the bottom in place of the tab bar on iPhone.
   */
  searchPrompt?: string;
  onSearchTextChange?: (text: string) => void;
  /** Puts this text in the search field each time `searchRequest` changes. */
  requestedSearchText?: string;
  searchRequest?: number;
  /** `SidebarTab` elements, main tabs first. */
  children: ReactNode;
};

/**
 * A SwiftUI `TabView` in the sidebar-adaptable style. On iPad the main tabs show as the floating
 * tab bar, which expands into a sidebar that also lists sidebar-only sections. Render it inside
 * an `@expo/ui` `Host`.
 */
export function SidebarTabView({
  modifiers,
  onSelectionChange,
  onSearchTextChange,
  ...props
}: SidebarTabViewProps) {
  return (
    <NativeSidebarTabView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...props}
      onSelectionChange={({ nativeEvent }) => onSelectionChange(nativeEvent.selection)}
      onSearchTextChange={({ nativeEvent }) => onSearchTextChange?.(nativeEvent.text)}
    />
  );
}

export type SidebarTabProps = {
  value: string;
  label: string;
  systemImage: SFSymbol;
  /** Puts the tab in a sidebar-only section with this title. Omit for a main tab. */
  section?: string;
  badge?: number;
  /** `'search'` makes it the search tab, shown as a separate search button beside the tab bar. */
  role?: 'search';
  /** The tab's content: `@expo/ui` SwiftUI views. */
  children?: ReactNode;
};

/** One tab of a `SidebarTabView`. */
export const SidebarTab = requireNativeView<SidebarTabProps>('SidebarTabs', 'SidebarTab');

/**
 * Removes a `NavigationSplitView`'s own sidebar button. Apply it to the sidebar column's content
 * so the tab view's sidebar button is the only sidebar control, as in Apple's apps.
 */
export const removeSidebarToggle = () => createModifier('removeSidebarToggle', {});
