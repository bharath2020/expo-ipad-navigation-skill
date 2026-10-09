import {
  Button,
  ContentUnavailableView,
  Group,
  NavigationSplitView,
  Toolbar,
  ToolbarItem,
  type NavigationSplitViewColumn,
  type NavigationSplitViewVisibility,
} from '@expo/ui/swift-ui';
import { navigationBarTitleDisplayMode, navigationTitle } from '@expo/ui/swift-ui/modifiers';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { removeSidebarToggle } from '../../modules/sidebar-tabs';
import { getPage } from '../example-data';
import { OpenInNewWindowButton } from './open-in-new-window-button';
import { PageDetail } from './page-detail';

const isPad = Platform.OS === 'ios' && Platform.isPad;

/**
 * The list / detail layout of a tab: SwiftUI `NavigationSplitView` from `@expo/ui`. The tab view
 * owns the only sidebar button, so the split view's own one is removed. Render inside a `Host`.
 */
export function PageSplitView({ list, pageId }: { list: ReactNode; pageId: string | null }) {
  const [visibility, setVisibility] = useState<NavigationSplitViewVisibility>('all');
  const [compactColumn, setCompactColumn] = useState<NavigationSplitViewColumn>('sidebar');
  const fullScreen = visibility === 'detailOnly';

  // In one-column layouts (Slide Over, narrow windows) show the page the user just picked.
  useEffect(() => {
    if (pageId) setCompactColumn('detail');
  }, [pageId]);

  return (
    <NavigationSplitView
      columnVisibility={visibility}
      onColumnVisibilityChange={setVisibility}
      preferredCompactColumn={compactColumn}
      onPreferredCompactColumnChange={setCompactColumn}>
      <NavigationSplitView.Sidebar>
        <Group modifiers={[removeSidebarToggle()]}>{list}</Group>
      </NavigationSplitView.Sidebar>
      <NavigationSplitView.Detail>
        {pageId ? (
          <Toolbar
            modifiers={[navigationTitle(getPage(pageId).title), navigationBarTitleDisplayMode('inline')]}>
            <PageDetail pageId={pageId} />
            <Toolbar.Content>
              <ToolbarItem placement="topBarTrailing">
                <OpenInNewWindowButton pageId={pageId} />
              </ToolbarItem>
              {/* iPad only: iPhone always shows one column, so there is nothing to hide. */}
              {isPad ? (
                <ToolbarItem placement="topBarTrailing">
                  <Button
                    label={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
                    systemImage={
                      fullScreen
                        ? 'arrow.down.right.and.arrow.up.left'
                        : 'arrow.up.left.and.arrow.down.right'
                    }
                    onPress={() => setVisibility(fullScreen ? 'all' : 'detailOnly')}
                  />
                </ToolbarItem>
              ) : null}
            </Toolbar.Content>
          </Toolbar>
        ) : (
          <ContentUnavailableView
            title="No Selection"
            systemImage="doc.text.magnifyingglass"
            description="Choose an item from the list."
          />
        )}
      </NavigationSplitView.Detail>
    </NavigationSplitView>
  );
}
