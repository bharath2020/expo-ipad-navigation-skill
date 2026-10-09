// Placeholder content for the templates. Replace with the app's own data and screens.
import type { SFSymbol } from 'expo-symbols';

export type Page = { id: string; title: string; collection: string; body: string };
export type Collection = { key: string; name: string; icon: SFSymbol };

export const COLLECTIONS: Collection[] = [
  { key: 'work', name: 'Work', icon: 'briefcase' },
  { key: 'personal', name: 'Personal', icon: 'person' },
];

export const PAGES: Page[] = [
  { id: 'p1', title: 'First page', collection: 'work', body: 'Body of the first page.' },
  { id: 'p2', title: 'Second page', collection: 'work', body: 'Body of the second page.' },
  { id: 'p3', title: 'Third page', collection: 'personal', body: 'Body of the third page.' },
];

export const FAVORITE_PAGE_IDS = ['p1', 'p3'];

export function getPage(id: string): Page {
  return PAGES.find((page) => page.id === id) ?? PAGES[0];
}

export function searchPages(query: string): Page[] {
  const q = query.toLowerCase();
  return PAGES.filter((page) => `${page.title} ${page.body}`.toLowerCase().includes(q));
}
