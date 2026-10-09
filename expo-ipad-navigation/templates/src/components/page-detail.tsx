import { ScrollView, Text, VStack } from '@expo/ui/swift-ui';
import { font, frame, padding } from '@expo/ui/swift-ui/modifiers';

import { getPage } from '../example-data';

/** The detail content for one page. Replace with the app's own detail view. */
export function PageDetail({ pageId }: { pageId: string }) {
  const page = getPage(pageId);
  return (
    <ScrollView>
      <VStack
        alignment="leading"
        spacing={12}
        modifiers={[padding({ all: 20 }), frame({ maxWidth: Infinity, alignment: 'leading' })]}>
        <Text modifiers={[font({ textStyle: 'largeTitle', weight: 'bold' })]}>{page.title}</Text>
        <Text>{page.body}</Text>
      </VStack>
    </ScrollView>
  );
}
