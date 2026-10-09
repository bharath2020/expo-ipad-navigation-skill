import { Button } from '@expo/ui/swift-ui';

import { canOpenPageWindows, openPageInNewWindow } from '../../modules/page-windows';
import { getPage } from '../example-data';

/** Opens the page in a new iPad window. Renders nothing on iPhone, which has one window. */
export function OpenInNewWindowButton({ pageId }: { pageId: string }) {
  if (!canOpenPageWindows) return null;
  return (
    <Button
      label="Open in New Window"
      systemImage="macwindow.badge.plus"
      onPress={() => openPageInNewWindow(pageId, getPage(pageId).title)}
    />
  );
}
