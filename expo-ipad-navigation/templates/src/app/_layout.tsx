import { Slot } from 'expo-router';

// The main window's navigation is the sidebar-adaptable tab view in `index.tsx`, so the router
// only renders that single route.
export default function RootLayout() {
  return <Slot />;
}
