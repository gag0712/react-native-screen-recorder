require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ScreenRecorder"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/gag0712/react-native-screen-recorder.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.private_header_files = "ios/**/*.h"

  # ReplayKit 프레임워크 추가
  s.frameworks = "ReplayKit"

  install_modules_dependencies(s)
end
