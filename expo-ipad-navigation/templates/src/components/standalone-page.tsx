import { NavigationStack, Toolbar, ToolbarItem } from '@expo/ui/swift-ui';
import { navigationBarTitleDisplayMode, navigationTitle } from '@expo/ui/swift-ui/modifiers';
import type { ReactNode } from 'react';

import { getPage } from '../example-data';
import { PageDetail } from './page-detail';

/**
 * One page with no list beside it, plus toolbar actions. Used by page windows and by
 * sidebar-only tabs that show a single page. Render inside an `@expo/ui` `Host`.
 */
export function StandalonePage({ pageId, actions }: { pageId: string; actions?: ReactNode }) {
  return (
    <NavigationStack>
      <Toolbar
        modifiers={[navigationTitle(getPage(pageId).title), navigationBarTitleDisplayMode('inline')]}>
        <PageDetail pageId={pageId} />
        <Toolbar.Content>
          <ToolbarItem placement="topBarTrailing">{actions}</ToolbarItem>
        </Toolbar.Content>
      </Toolbar>
    </NavigationStack>
  );
}
