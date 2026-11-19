import { DevicePlatform, ProviderDomain } from '../types/app';

interface FooterProps {
  onSelectPlatform: (platform: DevicePlatform) => void;
  onSelectProvider: (provider: ProviderDomain) => void;
}

export function Footer({ onSelectPlatform, onSelectProvider }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <span className="font-display text-lg font-bold text-slate-900">AXIOS TV</span>
          <p className="text-xs text-slate-500 mt-1">
            بوابة عربية موحدة لتنزيل حزم APK للهاتف وAndroid TV من مصادرها الرسمية.
          </p>
        </div>

        <nav
          aria-label="روابط التذييل"
          className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600"
        >
          <a
            href="#catalog"
            onClick={() => onSelectPlatform('phone')}
            className="hover:text-blue-600 transition-colors"
          >
            APK الهاتف
          </a>
          <a
            href="#catalog"
            onClick={() => onSelectPlatform('tv')}
            className="hover:text-blue-600 transition-colors"
          >
            APK التلفاز TV
          </a>
          <a
            href="#catalog"
            onClick={() => {
              onSelectPlatform('all');
              onSelectProvider('f-droid.org');
            }}
            className="hover:text-blue-600 transition-colors"
          >
            مستودع F-Droid
          </a>
          <a
            href="#fdroid-hub"
            className="hover:text-blue-600 transition-colors"
          >
            جلب حزمة F-Droid
          </a>
          <a
            href="#apk-export"
            className="hover:text-blue-600 transition-colors"
          >
            مشروع Android APK
          </a>
        </nav>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} AXIOS TV</p>
      </div>
    </footer>
  );
}
