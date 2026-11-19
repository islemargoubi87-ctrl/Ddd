import { useState } from 'react';
import { Download, FolderArchive, Smartphone, Tv } from 'lucide-react';
import { DEFAULT_WRAPPER_URL, sanitizeWrapperUrl } from '../utils/androidProjectGenerator';
import { triggerDirectServerDownload } from '../utils/download';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkWrapperSectionProps {
  tvMode: boolean;
  onToggleTvMode: () => void;
}

export function ApkWrapperSection({ tvMode, onToggleTvMode }: ApkWrapperSectionProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [targetUrl, setTargetUrl] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.origin.startsWith('http')) {
      return DEFAULT_WRAPPER_URL;
    }
    return DEFAULT_WRAPPER_URL;
  });
  const [exportedOnce, setExportedOnce] = useState(false);

  const handleDownloadAndroidKit = () => {
    const cleanUrl = sanitizeWrapperUrl(targetUrl);
    const apiUrl = `/api/android-project.zip?appUrl=${encodeURIComponent(cleanUrl)}`;
    triggerDirectServerDownload(apiUrl, 'AXIOS-TV-Phone-TV-AndroidProject.zip');
    setExportedOnce(true);
  };

  return (
    <section
      id="apk-export"
      className="scroll-mt-24 border-t border-slate-200 bg-[#F5F6F8] py-12 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 mb-1.5">
              تشغيل AXIOS TV كتطبيق مستقل على الهاتف والتلفاز
            </p>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              تحويل AXIOS TV إلى تطبيق هاتف وAndroid TV APK
            </h2>
          </div>
          <p className="max-w-lg text-sm text-slate-600">
            ثبّت الواجهة فوراً كتطبيق ويب مستقل على الهاتف، فعّل تحكم الريموت لشاشة التلفاز، أو نزّل
            حزمة مشروع Android Studio / Gradle المهيأة لبناء ملفات APK أصلية للهاتف وAndroid TV.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Card 1: Instant Phone Install (PWA) & Android TV Remote Mode */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {/* Phone PWA Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-slate-900 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">تطبيق الهاتف الفوري (WebAPK)</h3>
                    <p className="text-xs text-slate-500">أندرويد Chrome · iOS Safari</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  التطبيق مجهز بملف Manifest وأيقونات 192/512px وعامل خدمة بدون اتصال لتثبيته على
                  شاشة الهاتف الرئيسية بواجهة مستقلة.
                </p>
              </div>

              {isInstalled ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-semibold text-blue-800">
                  التطبيق مثبت حالياً ويعمل بوضع التطبيق المستقل.
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={() => void install()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px] cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>تثبيت AXIOS TV على الهاتف الآن</span>
                </button>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 leading-relaxed">
                  من متصفح الهاتف (Chrome أو Safari): افتح قائمة المتصفح واختر{' '}
                  <strong className="text-slate-900">تثبيت التطبيق / Add to Home Screen</strong>.
                </div>
              )}
            </div>

            {/* Android TV D-Pad Mode Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-slate-900 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <Tv className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">وضع التلفاز والريموت (D-Pad Mode)</h3>
                    <p className="text-xs text-slate-500">Android TV · Google TV · TV Box</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  يفعّل مؤشر التركيز العالي التباين والتنقل بأسهم الريموت (أعلى/أسفل/يمين/يسار + OK)
                  عند تشغيل البوابة على شاشة التلفاز.
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleTvMode}
                data-testid="section-tv-mode-btn"
                aria-pressed={tvMode}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                  tvMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>{tvMode ? 'وضع التلفاز TV مفعل (إيقاف)' : 'تفعيل وضع التلفاز Android TV'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Download Full Native Android Studio / Gradle Phone + TV APK Project */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <FolderArchive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      حزمة بناء APK أصلية للهاتف والتلفاز (Android Kotlin + Gradle)
                    </h3>
                    <p dir="ltr" className="font-mono-tabular text-xs text-slate-500 text-right">
                      com.axiostv.app.phone · com.axiostv.app.tv
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                حزمة مشروع أندرويد كاملة وجاهزة للتجميع (تحتوي على{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  LAUNCHER
                </span>{' '}
                للهواتف و{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  LEANBACK_LAUNCHER
                </span>{' '}
                لشاشات Android TV، مع جسر تحميل مباشر عبر{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  DownloadManager
                </span>{' '}
                وملف{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  GitHub Actions
                </span>{' '}
                لتصدير ملفي{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  phone.apk
                </span>{' '}
                و{' '}
                <span dir="ltr" className="font-mono-tabular text-slate-800">
                  tv.apk
                </span>{' '}
                تلقائياً).
              </p>

              {/* Included Capabilities Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                  <div className="font-bold text-slate-900 mb-1">1. نكهة الهاتف (Phone Flavor)</div>
                  <p className="text-slate-600 leading-relaxed">
                    تدعم تثبيت حزم APK من داخل التطبيق مع شريط حالة متوافق وأيقونة دائرية عالية الدقة.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                  <div className="font-bold text-slate-900 mb-1">2. نكهة التلفاز (Android TV Flavor)</div>
                  <p className="text-slate-600 leading-relaxed">
                    تشمل بانر 320×180 لشاشة Google TV وإقلاع مباشر بوضع الريموت{' '}
                    <span dir="ltr" className="font-mono-tabular">
                      ?tv=1
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Target Server URL Input */}
              <div className="mb-5">
                <label
                  htmlFor="android-wrapper-url"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  رابط تشغيل AXIOS TV داخل ملف APK
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="android-wrapper-url"
                    type="url"
                    dir="ltr"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={DEFAULT_WRAPPER_URL}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono-tabular text-xs text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px] text-left"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadAndroidKit}
                    data-testid="download-android-project-btn"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>تحميل حزمة Android (هاتف + TV)</span>
                  </button>
                </div>
              </div>
            </div>

            {exportedOnce && (
              <div
                data-testid="android-kit-feedback"
                aria-live="polite"
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 leading-relaxed"
              >
                تم تنزيل <strong>AXIOS-TV-Phone-TV-AndroidProject.zip</strong>. افتح المجلد في Android
                Studio أو ارفعه إلى GitHub لتشغيل{' '}
                <span dir="ltr" className="font-mono-tabular font-semibold">
                  gradle assemblePhoneDebug assembleTvDebug
                </span>{' '}
                وإنتاج ملفي APK للهاتف والتلفاز.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
