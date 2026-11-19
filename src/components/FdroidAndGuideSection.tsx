import { useState } from 'react';
import { Download, ExternalLink, PackageSearch, Smartphone, Tv } from 'lucide-react';
import { buildFdroidApiDownloadUrl, triggerDirectServerDownload } from '../utils/download';

interface FdroidPackageLookup {
  packageName: string;
  suggestedVersionCode: number;
  packages: { versionName: string; versionCode: number }[];
}

const QUICK_FDROID_SAMPLES = [
  { pkg: 'org.videolan.vlc', label: 'VLC Media Player' },
  { pkg: 'org.xbmc.kodi', label: 'Kodi TV Center' },
  { pkg: 'org.schabi.newpipe', label: 'NewPipe' },
  { pkg: 'org.localsend.localsend_app', label: 'LocalSend' },
  { pkg: 'de.danoeh.antennapod', label: 'AntennaPod' },
];

export function FdroidAndGuideSection() {
  const [packageInput, setPackageInput] = useState('org.videolan.vlc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FdroidPackageLookup | null>(null);

  const runLookup = async (pkgToQuery: string) => {
    const cleanPkg = pkgToQuery.trim();
    if (!cleanPkg) {
      setError('أدخل معرف الحزمة من F-Droid (مثال: org.videolan.vlc)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fdroid/lookup?pkg=${encodeURIComponent(cleanPkg)}`);
      const payload = (await response.json()) as FdroidPackageLookup & { error?: string };
      if (!response.ok) {
        setResult(null);
        setError(payload.error ?? 'تعذر العثور على الحزمة في مستودع F-Droid.');
      } else {
        setResult(payload);
      }
    } catch {
      setResult(null);
      setError('تعذر الاتصال بخادم F-Droid حالياً.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runLookup(packageInput);
  };

  return (
    <section
      id="fdroid-hub"
      className="scroll-mt-20 border-t border-slate-200 bg-white py-12 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Live F-Droid Package Resolver & Direct APK Downloader */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">
                مزود F-Droid المباشر (استدعاء أي حزمة APK)
              </h2>
              <a
                href="https://f-droid.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono-tabular text-xs font-semibold text-blue-600 hover:underline shrink-0"
              >
                <span dir="ltr">f-droid.org</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              أدخل معرف أي حزمة أندرويد موجودة في مستودع F-Droid الرسمي لجلب أحدث إصداراتها وتنزيل
              ملف الـ APK مباشرة على هاتفك أو تلفازك.
            </p>

            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <label htmlFor="fdroid-pkg-input" className="sr-only">
                  معرف حزمة F-Droid
                </label>
                <input
                  id="fdroid-pkg-input"
                  type="text"
                  dir="ltr"
                  value={packageInput}
                  onChange={(e) => setPackageInput(e.target.value)}
                  placeholder="org.videolan.vlc"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono-tabular text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none min-h-[44px] text-left"
                />
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="fdroid-lookup-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors min-h-[44px] whitespace-nowrap cursor-pointer"
                >
                  <PackageSearch className="h-4 w-4" />
                  <span>{loading ? 'جارٍ الجلب...' : 'جلب من F-Droid'}</span>
                </button>
              </form>

              {/* Quick sample buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 ml-1">حزم شائعة:</span>
                {QUICK_FDROID_SAMPLES.map((item) => (
                  <button
                    key={item.pkg}
                    type="button"
                    onClick={() => {
                      setPackageInput(item.pkg);
                      void runLookup(item.pkg);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mt-4 text-xs font-semibold text-red-600" role="alert">
                  {error}
                </p>
              )}

              {result && (
                <div
                  data-testid="fdroid-lookup-result"
                  className="mt-5 rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div dir="ltr" className="font-mono-tabular text-sm font-bold text-slate-900">
                        {result.packageName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        النسخ المتوفرة مباشرة على خوادم f-droid.org
                      </div>
                    </div>
                    {result.packages[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          const apiUrl = buildFdroidApiDownloadUrl(
                            result.packageName,
                            result.packages[0].versionCode
                          );
                          triggerDirectServerDownload(
                            apiUrl,
                            `${result.packageName}-v${result.packages[0].versionName}-fdroid.apk`
                          );
                        }}
                        data-testid="fdroid-direct-download-btn"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer min-h-[38px]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>تحميل أحدث APK (v{result.packages[0].versionName})</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {result.packages.map((ver) => (
                      <div
                        key={ver.versionCode}
                        className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span dir="ltr" className="font-mono-tabular font-semibold text-slate-800">
                            v{ver.versionName}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span dir="ltr" className="font-mono-tabular text-slate-500">
                            Code {ver.versionCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const apiUrl = buildFdroidApiDownloadUrl(
                              result.packageName,
                              ver.versionCode
                            );
                            triggerDirectServerDownload(
                              apiUrl,
                              `${result.packageName}-v${ver.versionName}-fdroid.apk`
                            );
                          }}
                          className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>تحميل APK</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone & Android TV Sideload Guide */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              دليل التثبيت على الهاتف والتلفاز
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              خطوات عملية لتثبيت حزم الهاتف وAndroid TV APK ونقلها لاسلكياً بين أجهزتك.
            </p>

            <div className="space-y-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                  <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>01. التثبيت على الهاتف</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  اختر زر «هاتف APK» لبدء التحميل المباشر، ثم افتح الملف من مدير الملفات واسمح
                  بالتثبيت من هذا المصدر عند الطلب.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                  <Tv className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>02. التثبيت على Android TV</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  استخدم أزرار «تلفاز APK» المخصصة للريموت (مثل NetMirror TV وNetfly TV وCastle
                  for TV وKodi). يمكنك إرسال الملف من هاتفك إلى التلفاز عبر تطبيق LocalSend الموجود
                  في مكتبة F-Droid أعلاه.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm font-bold text-slate-900 mb-1">
                  03. التحديث عبر متجر F-Droid
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  ثبّت عميل F-Droid.apk على جهازك أو تلفازك لإبقاء تطبيقات VLC وKodi وNewPipe
                  وLocalSend محدثة تلقائياً من المصدر الرسمي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
