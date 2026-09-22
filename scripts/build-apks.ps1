$ErrorActionPreference = "Stop"

$workspace = "C:\Users\DerEine\Desktop\app bodega"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = "C:\Users\DerEine\AppData\Local\Android\Sdk"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPILANDO APK UNIFICADA BOGAD..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location $workspace
& npx vite build

$unifiedCapConfig = @"
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bogad.app',
  appName: 'Bogad',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
"@
Set-Content -Path "$workspace\capacitor.config.ts" -Value $unifiedCapConfig -Encoding UTF8

& npx cap sync android

$killSw = @"
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.registration.unregister();
    })
  );
});
"@
if (Test-Path "$workspace\android\app\src\main\assets\public\sw.js") {
  Set-Content -Path "$workspace\android\app\src\main\assets\public\sw.js" -Value $killSw -Encoding UTF8
}

(Get-Content "$workspace\android\app\build.gradle") -replace 'applicationId ".*"', 'applicationId "com.bogad.app"' | Set-Content "$workspace\android\app\build.gradle"
(Get-Content "$workspace\android\app\src\main\res\values\strings.xml") -replace '<string name="app_name">.*</string>', '<string name="app_name">Bogad</string>' | Set-Content "$workspace\android\app\src\main\res\values\strings.xml"

Set-Location "$workspace\android"
& .\gradlew.bat assembleDebug
Copy-Item "$workspace\android\app\build\outputs\apk\debug\app-debug.apk" "$workspace\Bogad.apk" -Force
Copy-Item "$workspace\android\app\build\outputs\apk\debug\app-debug.apk" "$workspace\Bogad-Dueño.apk" -Force
Copy-Item "$workspace\android\app\build\outputs\apk\debug\app-debug.apk" "$workspace\Bogad-Dueno.apk" -Force
Copy-Item "$workspace\android\app\build\outputs\apk\debug\app-debug.apk" "$workspace\Bogad-Cliente.apk" -Force

Write-Host "==========================================" -ForegroundColor Green
Write-Host "¡APK UNIFICADA GENERADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "APK Principal: $workspace\Bogad.apk" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
