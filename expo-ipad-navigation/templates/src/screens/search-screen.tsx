import {
  Button,
  ContentUnavailableView,
  Group,
  List,
  NavigationDestination,
  NavigationLink,
  NavigationStack,
  Section,
  Text,
  Toolbar,
  ToolbarItem,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  listStyle,
  navigationBarTitleDisplayMode,
  navigationTitle,
} from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { Platform } from 'react-native';

import { OpenInNewWindowButton } from '../components/open-in-new-window-button';
import { PageDetail } from '../components/page-detail';
import { PageRow } from '../components/page-row';
import { getPage, searchPages } from '../example-data';

const isPad = Platform.OS === 'ios' && Platform.isPad;
const MAX_RECENT_SEARCHES = 6;

type Props = {
  /** The text in the system search field that `SidebarTabView` shows for the search-role tab. */
  query: string;
  /** Puts `text` in the search field, e.g. when a recent search is tapped. */
  onRequestQuery: (text: string) => void;
};

/**
 * The search-role tab, laid out like Apple News: one full-width page under the system search
 * field. Before typing it shows recent searches (or an empty state); while typing, results fill
 * the page, and tapping one pushes it.
 */
export function SearchScreen({ query, onRequestQuery }: Props) {
  const [path, setPath] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const trimmed = query.trim();
  const results = trimmed ? searchPages(trimmed) : [];

  const onPathChange = (next: string[]) => {
    // Opening a result from the root remembers the search that found it.
    if (path.length === 0 && next.length > 0 && trimmed) {
      setRecent((prev) => [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, MAX_RECENT_SEARCHES));
    }
    setPath(next);
  };

  let content;
  if (trimmed && results.length === 0) {
    content = (
      <ContentUnavailableView
        title={`No Results for “${trimmed}”`}
        systemImage="magnifyingglass"
        description="Check the spelling or try a new search."
      />
    );
  } else if (trimmed) {
    content = (
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section title={`${results.length} result${results.length === 1 ? '' : 's'}`}>
          {results.map((page) => (
            <NavigationLink key={page.id} value={page.id}>
              <PageRow rowTag={`result:${page.id}`} pageId={page.id} />
            </NavigationLink>
          ))}
        </Section>
      </List>
    );
  } else if (recent.length > 0) {
    content = (
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section title="Recent Searches">
          {recent.map((text) => (
            <Button key={text} onPress={() => onRequestQuery(text)} modifiers={[buttonStyle('plain')]}>
              <Text>{text}</Text>
            </Button>
          ))}
        </Section>
      </List>
    );
  } else {
    content = (
      <ContentUnavailableView
        title="No Recent Searches"
        systemImage="magnifyingglass"
        description="Your recent searches will appear here."
      />
    );
  }

  return (
    <NavigationStack path={path} onPathChange={onPathChange}>
      {/* No title or toolbar items on iPad, so the search field is the only bar at the top. */}
      <Group modifiers={[navigationTitle(isPad ? '' : 'Search'), navigationBarTitleDisplayMode('inline')]}>
        {content}
      </Group>
      {[...new Set(path)].map((pageId) => (
        <NavigationDestination key={pageId} value={pageId}>
          <Toolbar
            modifiers={[navigationTitle(getPage(pageId).title), navigationBarTitleDisplayMode('inline')]}>
            <PageDetail pageId={pageId} />
            <Toolbar.Content>
              <ToolbarItem placement="topBarTrailing">
                <OpenInNewWindowButton pageId={pageId} />
              </ToolbarItem>
            </Toolbar.Content>
          </Toolbar>
        </NavigationDestination>
      ))}
    </NavigationStack>
  );
}
