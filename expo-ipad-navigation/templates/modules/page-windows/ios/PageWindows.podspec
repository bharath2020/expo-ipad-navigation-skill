Pod::Spec.new do |s|
  s.name           = 'PageWindows'
  s.version        = '1.0.0'
  s.summary        = 'Opens a page of the app in its own iPad window'
  s.description    = 'Scene delegate, open-in-new-window function, and a drag-out modifier for @expo/ui rows.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'
  s.dependency 'Expo'
  s.dependency 'ExpoUI'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  s.source_files = "**/*.{h,m,swift}"
end
