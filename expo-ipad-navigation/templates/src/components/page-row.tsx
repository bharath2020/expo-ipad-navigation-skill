import { HStack, Image, Text } from '@expo/ui/swift-ui';
import { tag } from '@expo/ui/swift-ui/modifiers';

import { pageDragOut } from '../../modules/page-windows';
import { getPage } from '../example-data';

/**
 * A list row for a page. `pageDragOut` lets the user long-press the row and drag it out of the
 * window to open the page in a new iPad window.
 */
export function PageRow({ rowTag, pageId }: { rowTag: string; pageId: string }) {
  const page = getPage(pageId);
  return (
    <HStack spacing={12} modifiers={[tag(rowTag), pageDragOut({ pageId, title: page.title })]}>
      <Image systemName="doc.text" size={18} />
      <Text>{page.title}</Text>
    </HStack>
  );
}
