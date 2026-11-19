import {
  BadgeCheck,
  Bookmark,
  Download,
  ExternalLink,
  Smartphone,
  Tv,
} from 'lucide-react';
import { AppVersion, ModApp } from '../types/app';
import { formatDownloadCount, getPhoneAndTvVersions } from '../utils/catalog';
import { AppIcon } from './AppIcon';

interface AppCardProps {
  app: ModApp;
  isBookmarked: boolean;
  activeDownloadKey: string | null;
  onOpenDetails: (app: ModApp) => void;
  onStartDownload: (app: ModApp, version: AppVersion) => void;
  onToggleBookmark: (appId: string) => void;
}

export function AppCard({
  app,
  isBookmarked,
  activeDownloadKey,
  onOpenDetails,
  onStartDownload,
  onToggleBookmark,
}: AppCardProps) {
  const { phoneVersion, tvVersion, primaryVersion } = getPhoneAndTvVersions(app);
  const hasSeparateBuilds = Boolean(phoneVersion && tvVersion);
  const primaryMirror = app.mirrors[0];

  return (
    <article
      data-testid={`app-card-${app.id}`}
      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
    >
      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <AppIcon appId={app.id} accentHex={app.accentHex} glyph={app.iconGlyph} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-lg font-bold text-slate-900 truncate">
                  {app.name}
                </h3>
                <BadgeCheck className="h-4 w-4 shrink-0 text-blue-600" aria-label="مصدر موثق" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span dir="ltr" className="font-mono-tabular text-slate-700 font-medium">
                  {app.providerDomain}
                </span>
                <span aria-hidden="true">·</span>
                <span dir="ltr" className="font-mono-tabular truncate">
                  {app.packageId}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(app.id)}
            aria-label={isBookmarked ? `إزالة ${app.name} من المفضلة` : `حفظ ${app.name} في المفضلة`}
            aria-pressed={isBookmarked}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isBookmarked
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Clean Unboxed Device + Technical Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2.5">
          {app.platforms.includes('phone') && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
              <Smartphone className="h-3.5 w-3.5 text-blue-600" />
              <span>الهاتف</span>
            </span>
          )}
          {app.platforms.includes('phone') && app.platforms.includes('tv') && (
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
          )}
          {app.platforms.includes('tv') && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
              <Tv className="h-3.5 w-3.5 text-blue-600" />
              <span>التلفاز TV</span>
            </span>
          )}
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span dir="ltr" className="font-mono-tabular">
            v{primaryVersion.version}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span dir="ltr" className="font-mono-tabular">
            {primaryVersion.sizeMb} MB
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3.5">
          {app.shortTagline}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs mb-4">
          <span className="text-slate-500 truncate">
            {app.categoryLabel} · {formatDownloadCount(app.downloadsCount)} تحميل
          </span>
          {primaryMirror && (
            <a
              href={primaryMirror.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`زيارة مصدر ${app.name} على ${primaryMirror.domain}`}
              className="inline-flex items-center gap-1 font-mono-tabular text-[11px] text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              <span dir="ltr">{primaryMirror.domain}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Footer Dual Phone & TV Direct Download Actions */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails(app)}
          aria-label={`عرض تفاصيل ${app.name}`}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          التفاصيل
        </button>

        {hasSeparateBuilds && phoneVersion && tvVersion ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onStartDownload(app, phoneVersion)}
              data-testid={`card-download-${app.id}-phone`}
              aria-label={`تحميل ${app.name} للهاتف APK`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>
                {activeDownloadKey === `${app.id}:${phoneVersion.id}`
                  ? 'بدأ التحميل'
                  : 'هاتف APK'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onStartDownload(app, tvVersion)}
              data-testid={`card-download-${app.id}-tv`}
              aria-label={`تحميل ${app.name} للتلفاز APK`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>
                {activeDownloadKey === `${app.id}:${tvVersion.id}`
                  ? 'بدأ التحميل'
                  : 'تلفاز APK'}
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartDownload(app, primaryVersion)}
            data-testid={`card-download-${app.id}`}
            aria-label={`تحميل ${app.name} APK مباشرة`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>
              {activeDownloadKey === `${app.id}:${primaryVersion.id}`
                ? 'بدأ التحميل'
                : primaryVersion.targetDevice === 'tv'
                  ? 'تحميل للتلفاز APK'
                  : 'تحميل APK'}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
