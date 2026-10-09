import ExpoModulesCore
import ExpoUI
import SwiftUI

public class SidebarTabsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SidebarTabs")

    OnCreate {
      ViewModifierRegistry.register("removeSidebarToggle") { params, appContext, _ in
        return try RemoveSidebarToggleModifier(from: params, appContext: appContext)
      }
    }

    OnDestroy {
      ViewModifierRegistry.unregister("removeSidebarToggle")
    }

    ExpoUIView(SidebarTabView.self)
    ExpoUIView(SidebarTab.self)
  }
}

/// Removes a split view's own sidebar button, so the tab view's sidebar button is the only one.
struct RemoveSidebarToggleModifier: ViewModifier, Record {
  func body(content: Content) -> some View {
    if #available(iOS 17.0, *) {
      content.toolbar(removing: .sidebarToggle)
    } else {
      content
    }
  }
}

final class SidebarTabProps: UIBaseViewProps {
  @Field var value: String = ""
  @Field var label: String = ""
  @Field var systemImage: String = ""
  /// The sidebar section the tab belongs to. Tabs without one are the main tabs, shown in both
  /// the floating tab bar and the sidebar; tabs with one appear only in the sidebar.
  @Field var section: String?
  @Field var badge: Int = 0
  /// `"search"` makes it the search tab, which iPadOS shows as a separate search button beside
  /// the floating tab bar.
  @Field var role: String?
}

/// Marker for one tab. The enclosing `SidebarTabView` reads its props and renders its children
/// as the tab's content.
struct SidebarTab: ExpoSwiftUI.View {
  @ObservedObject var props: SidebarTabProps

  var body: some View {
    Children()
  }
}

final class SidebarTabViewProps: UIBaseViewProps {
  @Field var selection: String = ""
  /// Turns on the system search field for the search-role tab, with this placeholder.
  @Field var searchPrompt: String?
  /// Puts `requestedSearchText` in the search field whenever `searchRequest` changes.
  @Field var requestedSearchText: String = ""
  @Field var searchRequest: Int = 0
  var onSelectionChange = EventDispatcher()
  var onSearchTextChange = EventDispatcher()
}

/// SwiftUI's `TabView` in the `.sidebarAdaptable` style. On iPad the main tabs show as the
/// floating tab bar, which expands into a sidebar that also lists each section's tabs under a
/// `TabSection` header. @expo/ui's own `TabView` only supports flat tabs.
struct SidebarTabView: ExpoSwiftUI.View {
  @ObservedObject var props: SidebarTabViewProps
  @State private var searchText = ""

  var body: some View {
    let tabs = (props.children ?? []).compactMap(Self.unwrapTab)
    if #available(iOS 18.0, *) {
      sidebarTabView(tabs)
    } else {
      // Before iOS 18 there is no sidebar style: show the main tabs as a plain tab bar.
      SwiftUI.TabView(selection: selection) {
        ForEach(tabs.filter { $0.props.section == nil }, id: \.props.value) { tab in
          tab
            .tabItem { Label(tab.props.label, systemImage: tab.props.systemImage) }
            .tag(tab.props.value)
        }
      }
    }
  }

  @available(iOS 18.0, *)
  private func sidebarTabView(_ tabs: [SidebarTab]) -> some View {
    let mainTabs = tabs.filter { $0.props.section == nil }
    let sections = tabs.compactMap(\.props.section).reduce(into: [String]()) { names, name in
      if !names.contains(name) { names.append(name) }
    }
    return SwiftUI.TabView(selection: selection) {
      ForEach(mainTabs, id: \.props.value) { tab in
        tabItem(tab)
      }
      ForEach(sections, id: \.self) { section in
        TabSection(section) {
          ForEach(tabs.filter { $0.props.section == section }, id: \.props.value) { tab in
            tabItem(tab).defaultVisibility(.hidden, for: .tabBar)
          }
        }
        .defaultVisibility(.hidden, for: .tabBar)
      }
    }
    .tabViewStyle(.sidebarAdaptable)
    .onChange(of: searchText) { text in
      props.onSearchTextChange(["text": text])
    }
    .onChange(of: props.searchRequest) { _ in
      searchText = props.requestedSearchText
    }
  }

  @available(iOS 18.0, *)
  private func tabItem(_ tab: SidebarTab) -> some TabContent<String> {
    SwiftUI.Tab(
      tab.props.label,
      systemImage: tab.props.systemImage,
      value: tab.props.value,
      role: tab.props.role == "search" ? .search : nil
    ) {
      if tab.props.role == "search" {
        tab.modifier(TabSearch(prompt: props.searchPrompt, text: $searchText))
      } else {
        tab
      }
    }
    .badge(tab.props.badge)
  }

  private var selection: Binding<String> {
    let props = props
    return Binding(
      get: { props.selection },
      set: { newValue in
        if newValue != props.selection {
          props.onSelectionChange(["selection": newValue])
        }
      }
    )
  }

  /// `.searchable` on the search-role tab's content gives it the system search field. On iPhone
  /// the tab bar turns into it at the bottom (iOS 26). On iPad it runs across the top of the tab,
  /// as in Apple News.
  private struct TabSearch: ViewModifier {
    let prompt: String?
    @Binding var text: String

    func body(content: Content) -> some View {
      if let prompt, UIDevice.current.userInterfaceIdiom == .pad {
        // One full-width field across the top that stays put while typing, as in Apple News.
        let field = content.searchable(
          text: $text, placement: .navigationBarDrawer(displayMode: .always), prompt: prompt)
        if #available(iOS 17.1, *) {
          field.searchPresentationToolbarBehavior(.avoidHidingContent)
        } else {
          field
        }
      } else if let prompt {
        content.searchable(text: $text, prompt: prompt)
      } else {
        content
      }
    }
  }

  private static func unwrapTab(_ child: any ExpoSwiftUI.AnyChild) -> SidebarTab? {
    if let tab = child as? SidebarTab { return tab }
    if let wrapper = child as? ExpoSwiftUI.ViewWrapper {
      return wrapper.getWrappedView() as? SidebarTab
    }
    return nil
  }
}
