import { Button, Host } from '@expo/ui/swift-ui';

import { closePageWindow } from '../../modules/page-windows';
import { StandalonePage } from './standalone-page';

/**
 * The root of a window opened for a single page (see `index.tsx`). It must not use Expo Router:
 * the main window owns the only router root.
 */
export function PageWindow({ pageId }: { pageId: string }) {
  return (
    <Host style={{ flex: 1 }}>
      <StandalonePage
        pageId={pageId}
        actions={
          <Button label="Close Window" systemImage="xmark" onPress={() => closePageWindow(pageId)} />
        }
      />
    </Host>
  );
}
