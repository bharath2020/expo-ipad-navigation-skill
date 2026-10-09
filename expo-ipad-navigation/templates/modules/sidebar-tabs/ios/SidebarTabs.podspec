Pod::Spec.new do |s|
  s.name           = 'SidebarTabs'
  s.version        = '1.0.0'
  s.summary        = 'A sidebar-adaptable TabView with sidebar-only sections'
  s.description    = 'SwiftUI TabView in .sidebarAdaptable style with TabSection support, built on @expo/ui.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'
  s.dependency 'ExpoUI'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  s.source_files = "**/*.{h,m,swift}"
end
