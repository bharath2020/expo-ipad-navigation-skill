import Expo
import UIKit

/// The app's scene delegate. A window opened for a page (from the button or a dragged row)
/// starts React Native with `{ pageId }` as its initial props, so the JS root shows only that
/// page. The main window gets no initial props and shows the full app.
@objc(PageWindowsSceneDelegate)
public class PageSceneDelegate: ExpoAppSceneDelegate {
  private(set) var pageActivity: NSUserActivity?

  public override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    // A new page window arrives with the activity; a restored one keeps it on the session.
    pageActivity =
      connectionOptions.userActivities.first { $0.activityType == PageActivity.type }
      ?? session.stateRestorationActivity
    guard let pageActivity, let pageId = PageActivity.pageId(from: pageActivity) else {
      // The main window: Expo starts the full app.
      super.scene(scene, willConnectTo: session, options: connectionOptions)
      return
    }
    scene.userActivity = pageActivity
    scene.title = pageActivity.title

    // SDK 57's `ExpoAppSceneDelegate` can't pass initial props, so start the page window here.
    // It skips Expo's URL and activity forwarding, which a page window doesn't need.
    guard
      let windowScene = scene as? UIWindowScene,
      let provider = UIApplication.shared.delegate as? ExpoReactNativeFactoryProvider,
      let factory = provider.reactNativeFactory
    else {
      super.scene(scene, willConnectTo: session, options: connectionOptions)
      return
    }
    let window = UIWindow(windowScene: windowScene)
    self.window = window
    provider.window = window
    factory.startReactNative(
      withModuleName: provider.reactNativeFactoryModuleName,
      in: window,
      initialProperties: ["pageId": pageId],
      launchOptions: nil
    )
  }

  /// Saves the page so the window reopens on it after the app is relaunched.
  @objc public func stateRestorationActivity(for scene: UIScene) -> NSUserActivity? {
    return pageActivity
  }
}
