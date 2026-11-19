import { useState } from 'react';
import { Menu, Tv, X } from 'lucide-react';
import { DevicePlatform, ProviderDomain } from '../types/app';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  savedAndDownloadedCount: number;
  tvMode: boolean;
  onOpenDrawer: () => void;
  onToggleTvMode: () => void;
  onSelectPlatform: (platform: DevicePlatform) => void;
  onSelectProvider: (provider: ProviderDomain) => void;
}

export function Header({
  savedAndDownloadedCount,
  tvMode,
  onOpenDrawer,
  onToggleTvMode,
  onSelectPlatform,
  onSelectProvider,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 sm:gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={() => {
            onSelectPlatform('all');
            onSelectProvider('all');
          }}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          AXIOS TV
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600"
        >
          <a
            href="#catalog"
            onClick={() => {
              onSelectPlatform('phone');
              onSelectProvider('all');
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            تطبيقات الهاتف
          </a>
          <a
            href="#catalog"
            onClick={() => {
              onSelectPlatform('tv');
              onSelectProvider('all');
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            تطبيقات التلفاز
          </a>
          <a
            href="#fdroid-hub"
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            مزود F-Droid
          </a>
          <a
            href="#apk-export"
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            نسخة APK للنظام
          </a>
        </nav>

        {/* Zone 3: TV Remote Toggle, PWA Install (when supported), & Primary Downloads CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            type="button"
            onClick={onToggleTvMode}
            data-testid="header-tv-mode-btn"
            aria-pressed={tvMode}
            aria-label={tvMode ? 'إيقاف وضع التلفاز TV' : 'تفعيل وضع التلفاز TV'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
              tvMode
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Tv className="h-3.5 w-3.5 shrink-0" />
            <span>{tvMode ? 'وضع TV مفعل' : 'وضع TV'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label={`التنزيلات والمحفوظات (${savedAndDownloadedCount})`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>التنزيلات</span>
            <span className="font-mono-tabular text-xs opacity-90" data-testid="drawer-count">
              ({savedAndDownloadedCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-800 hover:bg-slate-100 min-h-[44px] min-w-[44px] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="القائمة الفرعية"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          <a
            href="#catalog"
            onClick={() => {
              onSelectPlatform('phone');
              setMobileMenuOpen(false);
            }}
            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            تطبيقات الهاتف
          </a>
          <a
            href="#catalog"
            onClick={() => {
              onSelectPlatform('tv');
              setMobileMenuOpen(false);
            }}
            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            تطبيقات التلفاز
          </a>
          <a
            href="#fdroid-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            مزود F-Droid
          </a>
          <a
            href="#apk-export"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            نسخة APK للهاتف والتلفاز
          </a>
        </nav>
      )}
    </header>
  );
}
