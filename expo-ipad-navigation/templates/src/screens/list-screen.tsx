import { List } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';

import { PageRow } from '../components/page-row';
import { PageSplitView } from '../components/page-split-view';
import type { Page } from '../example-data';

/** A tab's content: a list of pages on the left and the selected page on the right. */
export function ListScreen({ pages }: { pages: Page[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const onSelectionChange = (selection: (string | number)[]) => {
    // SwiftUI reports a set; keep the row that was just added so the list stays single-select.
    const next = selection.map(String).find((value) => value !== selected);
    if (next) setSelected(next);
  };

  return (
    <PageSplitView
      pageId={selected}
      list={
        <List
          selection={selected ? [selected] : []}
          onSelectionChange={onSelectionChange}
          modifiers={[listStyle('sidebar')]}>
          {pages.map((page) => (
            <PageRow key={page.id} rowTag={page.id} pageId={page.id} />
          ))}
        </List>
      }
    />
  );
}
