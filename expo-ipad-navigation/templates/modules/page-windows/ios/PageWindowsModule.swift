import ExpoModulesCore
import ExpoUI
import SwiftUI
import UIKit

/// The user activity that carries a page into a new window, whether it comes from the
/// "Open in New Window" button or from a list row dragged out of the window.
enum PageActivity {
  /// `<bundle identifier>.page`. The config plugin (`app.plugin.js`) lists the same type in
  /// `NSUserActivityTypes`, which iPadOS requires before it hands the activity to a new scene.
  static let type = "\(Bundle.main.bundleIdentifier ?? "app").page"

  static func make(pageId: String, title: String) -> NSUserActivity {
    let activity = NSUserActivity(activityType: type)
    activity.title = title
    activity.userInfo = ["pageId": pageId, "title": title]
    activity.targetContentIdentifier = pageId
    return activity
  }

  static func pageId(from activity: NSUserActivity?) -> String? {
    guard let activity, activity.activityType == type else { return nil }
    return activity.userInfo?["pageId"] as? String
  }
}

public class PageWindowsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PageWindows")

    OnCreate {
      ViewModifierRegistry.register("pageDragOut") { params, appContext, _ in
        return try PageDragOutModifier(from: params, appContext: appContext)
      }
    }

    OnDestroy {
      ViewModifierRegistry.unregister("pageDragOut")
    }

    /// Asks iPadOS for a new window showing the page. Rejects where the device can't show more
    /// than one window (iPhone).
    AsyncFunction("openPage") { (pageId: String, title: String, promise: Promise) in
      guard UIApplication.shared.supportsMultipleScenes else {
        promise.reject("ERR_SINGLE_WINDOW", "This device can't open more than one window")
        return
      }
      UIApplication.shared.requestSceneSessionActivation(
        nil,
        userActivity: PageActivity.make(pageId: pageId, title: title),
        options: nil
      ) { error in
        // Only called on failure, after the request has already been handed to the system.
        log.error("Opening a page window failed: \(error.localizedDescription)")
      }
      promise.resolve(nil)
    }.runOnQueue(.main)

    /// Closes the window that was opened for `pageId`. When several windows show that page, the
    /// one the user is interacting with wins. The main window is never closed this way.
    AsyncFunction("closePageWindow") { (pageId: String) -> Bool in
      let pageScenes = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .filter { PageActivity.pageId(from: ($0.delegate as? PageSceneDelegate)?.pageActivity) == pageId }
      guard
        let scene = pageScenes.first(where: { $0.windows.contains(where: \.isKeyWindow) })
          ?? pageScenes.first
      else {
        return false
      }
      UIApplication.shared.requestSceneSessionDestruction(scene.session, options: nil) { error in
        log.error("Closing a page window failed: \(error.localizedDescription)")
      }
      return true
    }.runOnQueue(.main)
  }
}

/// Lets a row be dragged out of the window. Dropping it at the screen edge or onto the Dock
/// opens the page in a new window.
struct PageDragOutModifier: ViewModifier, Record {
  @Field var pageId: String = ""
  @Field var title: String = ""

  func body(content: Content) -> some View {
    content.onDrag {
      let provider = NSItemProvider()
      provider.registerObject(PageActivity.make(pageId: pageId, title: title), visibility: .all)
      provider.suggestedName = title
      return provider
    }
  }
}
