import { Host, ProgressView } from '@expo/ui/swift-ui';
import { useState, type ReactNode } from 'react';

import { SidebarTab, SidebarTabView } from '../../modules/sidebar-tabs';
import { OpenInNewWindowButton } from '../components/open-in-new-window-button';
import { StandalonePage } from '../components/standalone-page';
import { COLLECTIONS, FAVORITE_PAGE_IDS, PAGES, getPage } from '../example-data';
import { ListScreen } from '../screens/list-screen';
import { SearchScreen } from '../screens/search-screen';

/**
 * The main window, in the style of Apple News on iPad: the main tabs show as the floating tab bar
 * at the top, with Search as a separate button. The bar's sidebar button expands it into a
 * sidebar that also lists sidebar-only sections. On iPhone the tabs sit at the bottom and the
 * sections move under More.
 */
export default function AppTabs() {
  const [selection, setSelection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRequest, setSearchRequest] = useState({ text: '', id: 0 });
  // Tabs mount the first time they are opened, then stay mounted to keep their state.
  const [visited, setVisited] = useState(() => new Set(['home']));

  const select = (value: string) => {
    setSelection(value);
    setVisited((prev) => (prev.has(value) ? prev : new Set([...prev, value])));
  };
  const lazy = (value: string, content: () => ReactNode) =>
    visited.has(value) ? content() : <ProgressView />;

  return (
    <Host style={{ flex: 1 }}>
      <SidebarTabView
        selection={selection}
        onSelectionChange={select}
        searchPrompt="Search"
        onSearchTextChange={setSearchQuery}
        requestedSearchText={searchRequest.text}
        searchRequest={searchRequest.id}>
        {/* First, as in Apple News: the sidebar lists Search at the top. */}
        <SidebarTab value="search" label="Search" systemImage="magnifyingglass" role="search">
          {lazy('search', () => (
            <SearchScreen
              query={searchQuery}
              onRequestQuery={(text) => setSearchRequest((prev) => ({ text, id: prev.id + 1 }))}
            />
          ))}
        </SidebarTab>
        <SidebarTab value="home" label="Home" systemImage="house">
          <ListScreen pages={PAGES} />
        </SidebarTab>
        <SidebarTab value="inbox" label="Inbox" systemImage="tray" badge={2}>
          {lazy('inbox', () => <ListScreen pages={PAGES.slice(0, 2)} />)}
        </SidebarTab>

        {/* Sidebar-only sections: hidden from the floating tab bar until selected. */}
        {COLLECTIONS.map((collection) => {
          const value = `collection:${collection.key}`;
          return (
            <SidebarTab
              key={value}
              value={value}
              label={collection.name}
              systemImage={collection.icon}
              section="Collections">
              {lazy(value, () => (
                <ListScreen pages={PAGES.filter((page) => page.collection === collection.key)} />
              ))}
            </SidebarTab>
          );
        })}
        {FAVORITE_PAGE_IDS.map((pageId) => {
          const value = `favorite:${pageId}`;
          return (
            <SidebarTab
              key={value}
              value={value}
              label={getPage(pageId).title}
              systemImage="star"
              section="Favorites">
              {lazy(value, () => (
                <StandalonePage pageId={pageId} actions={<OpenInNewWindowButton pageId={pageId} />} />
              ))}
            </SidebarTab>
          );
        })}
      </SidebarTabView>
    </Host>
  );
}
