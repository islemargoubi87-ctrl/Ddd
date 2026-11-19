import { ArrowDownLeft, Layers, Smartphone, Tv } from 'lucide-react';
import { DevicePlatform } from '../types/app';

interface HeroSectionProps {
  platform: DevicePlatform;
  totalAppsCount: number;
  phoneAppsCount: number;
  tvAppsCount: number;
  onSelectPlatform: (platform: DevicePlatform) => void;
}

export function HeroSection({
  platform,
  totalAppsCount,
  phoneAppsCount,
  tvAppsCount,
  onSelectPlatform,
}: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Editorial Pitch + Platform Switcher */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-3">
                بوابة AXIOS TV الرسمية · حزم APK أصلية ومعدلة للهاتف والتلفاز
              </p>

              <h1
                className="text-balance font-bold text-slate-900 leading-[1.2] mb-4"
                style={{ fontSize: 'clamp(1.95rem, 3.4vw, 2.95rem)' }}
              >
                مركز حزم APK للهاتف والتلفاز الذكي من مصادرها المباشرة
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-600 mb-7">
                تطبيقات حقيقية ومفحوصة بصيغ مستقلة للهواتف وشاشات Android TV وGoogle TV، يتم
                استدعاؤها وتحميلها مباشرة عبر{' '}
                <span dir="ltr" className="font-mono-tabular font-medium text-slate-800">
                  f-droid.org
                </span>{' '}
                و{' '}
                <span dir="ltr" className="font-mono-tabular font-medium text-slate-800">
                  netmirror.gg
                </span>{' '}
                و{' '}
                <span dir="ltr" className="font-mono-tabular font-medium text-slate-800">
                  netflyapp.com
                </span>{' '}
                و{' '}
                <span dir="ltr" className="font-mono-tabular font-medium text-slate-800">
                  app.apkmb.com
                </span>
                .
              </p>

              {/* Interactive Device Platform Selector */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 mb-2.5">
                  اختر منصة جهازك للبدء:
                </p>
                <div
                  role="group"
                  aria-label="اختيار جهاز التحميل"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectPlatform('all')}
                    data-testid="hero-platform-all"
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-right transition-colors cursor-pointer min-h-[48px] ${
                      platform === 'all'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-bold whitespace-nowrap">
                      <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>جميع الأجهزة</span>
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                      {totalAppsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPlatform('phone')}
                    data-testid="hero-platform-phone"
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-right transition-colors cursor-pointer min-h-[48px] ${
                      platform === 'phone'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-bold whitespace-nowrap">
                      <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>APK الهاتف</span>
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                      {phoneAppsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPlatform('tv')}
                    data-testid="hero-platform-tv"
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-right transition-colors cursor-pointer min-h-[48px] ${
                      platform === 'tv'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-bold whitespace-nowrap">
                      <Tv className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>APK التلفاز TV</span>
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                      {tvAppsCount}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span>استعراض الحزم المتوفرة ({totalAppsCount})</span>
                  <ArrowDownLeft className="h-4 w-4" />
                </a>
                <a
                  href="#apk-export"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span>تصدير كتطبيق هاتف وTV</span>
                </a>
              </div>
            </div>

            {/* Clean quantitative proof bar */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <div className="font-mono-tabular text-lg sm:text-xl font-bold text-slate-900">
                  {totalAppsCount}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">تطبيق حقيقي موثق</div>
              </div>
              <div>
                <div className="font-mono-tabular text-lg sm:text-xl font-bold text-slate-900">4</div>
                <div className="text-xs text-slate-500 mt-0.5">مزودات تحميل مباشرة</div>
              </div>
              <div>
                <div
                  dir="ltr"
                  className="font-mono-tabular text-base sm:text-xl font-bold text-slate-900 whitespace-nowrap text-right"
                >
                  Phone + TV
                </div>
                <div className="text-xs text-slate-500 mt-0.5">حزم مخصصة لكل شاشة</div>
              </div>
            </div>
          </div>

          {/* Crisp Studio Architectural Visual */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src="/src/assets/images/hero_phone_tv_studio_1795105444506.jpg"
                alt="هاتف أندرويد وشاشة تلفاز ذكي في استوديو AXIOS TV"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover min-h-[280px]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/92 via-slate-950/60 to-transparent pt-14 p-5 sm:p-6">
                <p className="text-xs font-semibold text-sky-200 mb-1">
                  توافق كامل مع الهاتف وAndroid TV
                </p>
                <p className="text-sm font-bold text-white">
                  تحميل مباشر لنسخ الهاتف والتلفاز بصيغة APK دون وسطاء أو روابط وهمية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
