import { buildZipArchive, ZipEntryInput } from './apkBuilder';

export const DEFAULT_WRAPPER_URL =
  'https://ais-pre-z5bj2s2bneujzh3jzrjyct-153594857927.europe-west2.run.app';

export interface AndroidProjectAssets {
  launcherIconPng?: Uint8Array;
  tvBannerPng?: Uint8Array;
}

export function sanitizeWrapperUrl(rawUrl?: string): string {
  if (!rawUrl) return DEFAULT_WRAPPER_URL;
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().replace(/\/+$/, '');
    }
  } catch {
    // ignore invalid URL and fall back safely
  }
  return DEFAULT_WRAPPER_URL;
}

export function buildAndroidProjectFiles(
  rawAppUrl?: string,
  assets: AndroidProjectAssets = {}
): ZipEntryInput[] {
  const encoder = new TextEncoder();
  const targetUrl = sanitizeWrapperUrl(rawAppUrl);
  const root = 'AXIOS-TV-Android-Phone-TV';

  const settingsGradle = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AXIOS-TV"
include(":app")
`;

  const rootBuildGradle = `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}
`;

  const gradleProperties = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`;

  const appBuildGradle = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.axiostv.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.axiostv.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "PORTAL_URL", "\\"${targetUrl}\\"")
    }

    flavorDimensions += "device"
    productFlavors {
        create("phone") {
            dimension = "device"
            applicationIdSuffix = ".phone"
            versionNameSuffix = "-Phone"
            resValue("string", "app_name", "AXIOS TV")
            buildConfigField("boolean", "IS_TV_MODE", "false")
        }
        create("tv") {
            dimension = "device"
            applicationIdSuffix = ".tv"
            versionNameSuffix = "-TV"
            resValue("string", "app_name", "AXIOS TV")
            buildConfigField("boolean", "IS_TV_MODE", "true")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.11.0")
}
`;

  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

    <!-- Optional TV & touchscreen features so one universal build or phone/tv flavors install on both -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:banner="@drawable/tv_banner"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.AxiosTv"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|uiMode"
            android:exported="true"
            android:launchMode="singleTop">
            <!-- Phone Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Android TV / Google TV Leanback Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
`;

  const mainActivityKt = `package com.axiostv.app

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.KeyEvent
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    private fun isAndroidTvDevice(): Boolean {
        return BuildConfig.IS_TV_MODE ||
            packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url ?: return false
                val host = url.host ?: return false
                val portalHost = Uri.parse(BuildConfig.PORTAL_URL).host
                return if (host == portalHost) {
                    false
                } else {
                    startActivity(Intent(Intent.ACTION_VIEW, url))
                    true
                }
            }
        }

        // Native APK DownloadManager bridge for Phone & Android TV
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
            val filename = URLUtil.guessFileName(
                url,
                contentDisposition,
                mimeType ?: "application/vnd.android.package-archive"
            )
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setMimeType(mimeType ?: "application/vnd.android.package-archive")
                addRequestHeader("User-Agent", userAgent)
                setTitle(filename)
                setDescription("جاري التحميل عبر AXIOS TV")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
            }
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(this, "بدأ تحميل: $filename", Toast.LENGTH_LONG).show()
        }

        val initialUrl = if (isAndroidTvDevice()) {
            "${targetUrl}/?tv=1"
        } else {
            BuildConfig.PORTAL_URL
        }
        webView.loadUrl(initialUrl)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
`;

  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.AxiosTv" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:statusBarColor">#2563EB</item>
        <item name="android:navigationBarColor">#F5F6F8</item>
    </style>
</resources>
`;

  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AXIOS TV</string>
</resources>
`;

  const filePathsXml = `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-path name="external_downloads" path="Download/" />
</paths>
`;

  const githubWorkflow = `name: Build AXIOS TV Phone & Android TV APKs

on:
  workflow_dispatch:
  push:
    branches: [ main, master ]

jobs:
  build-apks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.7'
      - name: Build Phone & Android TV APKs
        run: gradle assemblePhoneDebug assembleTvDebug
      - uses: actions/upload-artifact@v4
        with:
          name: AXIOS-TV-Phone-And-TV-APKs
          path: |
            app/build/outputs/apk/phone/debug/*.apk
            app/build/outputs/apk/tv/debug/*.apk
`;

  const readmeAr = `# حزمة بناء تطبيق AXIOS TV بصيغة APK للهاتف والتلفاز

هذا المشروع مهيأ بالكامل لبناء نسختين منفصلتين من تطبيق **AXIOS TV**:
1. **نسخة الهاتف (\`phone\`)**: \`com.axiostv.app.phone\` -> ينتج ملف \`app-phone-debug.apk\` / \`app-phone-release.apk\`.
2. **نسخة التلفاز (\`tv\`)**: \`com.axiostv.app.tv\` -> تتضمن \`LEANBACK_LAUNCHER\` وبانر Android TV ووضع الريموت (\`?tv=1\`).

## الرابط المضمن داخل التطبيق
\`${targetUrl}\`

## طريقة استخراج ملفات APK (طريقتان)
### 1. عبر Android Studio مباشرة
1. فك ضغط هذا الملف وافتح المجلد \`AXIOS-TV-Android-Phone-TV\` في **Android Studio**.
2. اختر Build Variant (\`phoneRelease\` للهاتف أو \`tvRelease\` للتلفاز).
3. اضغط **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

### 2. تلقائياً عبر GitHub Actions (بدون Android Studio)
1. ارفع محتويات هذا المجلد إلى مستودع GitHub خاص بك.
2. سيعمل ملف \`.github/workflows/build-apk.yml\` تلقائياً وينتج ملفي APK للهاتف والتلفاز في تبويب **Actions > Artifacts**.
`;

  const entries: ZipEntryInput[] = [
    { name: `${root}/settings.gradle.kts`, content: encoder.encode(settingsGradle) },
    { name: `${root}/build.gradle.kts`, content: encoder.encode(rootBuildGradle) },
    { name: `${root}/gradle.properties`, content: encoder.encode(gradleProperties) },
    { name: `${root}/app/build.gradle.kts`, content: encoder.encode(appBuildGradle) },
    { name: `${root}/app/proguard-rules.pro`, content: encoder.encode('# AXIOS TV Proguard Rules\n') },
    { name: `${root}/app/src/main/AndroidManifest.xml`, content: encoder.encode(androidManifest) },
    {
      name: `${root}/app/src/main/java/com/axiostv/app/MainActivity.kt`,
      content: encoder.encode(mainActivityKt),
    },
    { name: `${root}/app/src/main/res/values/styles.xml`, content: encoder.encode(stylesXml) },
    { name: `${root}/app/src/main/res/values/strings.xml`, content: encoder.encode(stringsXml) },
    { name: `${root}/app/src/main/res/xml/file_paths.xml`, content: encoder.encode(filePathsXml) },
    { name: `${root}/.github/workflows/build-apk.yml`, content: encoder.encode(githubWorkflow) },
    { name: `${root}/README-AR.md`, content: encoder.encode(readmeAr) },
  ];

  if (assets.launcherIconPng) {
    entries.push({
      name: `${root}/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`,
      content: assets.launcherIconPng,
    });
  }
  if (assets.tvBannerPng) {
    entries.push({
      name: `${root}/app/src/main/res/drawable/tv_banner.png`,
      content: assets.tvBannerPng,
    });
  }

  return entries;
}

export function buildAndroidProjectZip(
  rawAppUrl?: string,
  assets: AndroidProjectAssets = {}
): Uint8Array {
  return buildZipArchive(buildAndroidProjectFiles(rawAppUrl, assets));
}
