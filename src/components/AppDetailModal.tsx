import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
  Smartphone,
  Star,
  Tv,
  X,
} from 'lucide-react';
import { AppVersion, ModApp } from '../types/app';
import {
  buildPackageManifestText,
  formatDeviceLabel,
  formatDownloadCount,
  getSelectedVersion,
} from '../utils/catalog';
import { AppIcon } from './AppIcon';

interface AppDetailModalProps {
  app: ModApp | null;
  isBookmarked: boolean;
  lastDownloadedFilename: string | null;
  lastDownloadedSource: string | null;
  onClose: () => void;
  onStartDownload: (app: ModApp, version: AppVersion, mirrorDomain?: string) => void;
  onToggleBookmark: (appId: string) => void;
}

export function AppDetailModal({
  app,
  isBookmarked,
  lastDownloadedFilename,
  lastDownloadedSource,
  onClose,
  onStartDownload,
  onToggleBookmark,
}: AppDetailModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (app) {
      setSelectedVersionId(app.versions[0]?.id ?? '');
      setCopiedHash(false);
    }
  }, [app]);

  useEffect(() => {
    if (!app) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [app, onClose]);

  if (!app) {
    return null;
  }

  const activeVersion = getSelectedVersion(app, selectedVersionId);

  const handleCopySha = async () => {
    try {
      await navigator.clipboard.writeText(activeVersion.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      setCopiedHash(false);
    }
  };

  const handleSaveManifest = () => {
    const content = buildPackageManifestText(app, activeVersion);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.id}-v${activeVersion.version.replace(/\s+/g, '-')}-manifest.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-app-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <AppIcon appId={app.id} accentHex={app.accentHex} glyph={app.iconGlyph} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{app.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {app.providerDomain}
                </span>
                <span aria-hidden="true">·</span>
                <span dir="ltr" className="font-mono-tabular">
                  {app.packageId}
                </span>
              </div>
              <h2 id="modal-app-title" className="font-display text-2xl font-bold text-slate-900">
                {app.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التفاصيل"
            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Description & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">نبذة عن الحزمة</h3>
              <p className="text-sm leading-relaxed text-slate-600">{app.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">مميزات وتوافق الإصدار</h3>
              <ul className="space-y-2.5">
                {app.modFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">ملاحظات هذا البناء</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{activeVersion.changelog}</p>
            </div>
          </div>

          {/* Contiguous Download & Verification Module */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5">
            <div className="space-y-4">
              {/* Device / Version Selector */}
              <div>
                <label
                  htmlFor="version-selector"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  اختر نسخة الجهاز (الهاتف أو التلفاز)
                </label>
                <select
                  id="version-selector"
                  value={activeVersion.id}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px] cursor-pointer"
                >
                  {app.versions.map((ver) => (
                    <option key={ver.id} value={ver.id}>
                      {formatDeviceLabel(ver.targetDevice)} · v{ver.version} ({ver.sizeMb} MB)
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-600">
                  {activeVersion.targetDevice === 'tv' ? (
                    <Tv className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  <span>{activeVersion.label}</span>
                </p>
              </div>

              {/* Technical Specs */}
              <dl className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs border-y border-slate-200 py-3.5">
                <div>
                  <dt className="text-slate-500">الحجم</dt>
                  <dd dir="ltr" className="font-mono-tabular font-semibold text-slate-900 mt-0.5 text-right">
                    {activeVersion.sizeMb} MB
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">التقييم والتحميلات</dt>
                  <dd className="font-mono-tabular font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{app.rating.toFixed(1)}</span>
                    <span className="text-slate-500">({formatDownloadCount(app.downloadsCount)})</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">الجهاز المستهدف</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {formatDeviceLabel(activeVersion.targetDevice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">متطلب النظام</dt>
                  <dd dir="ltr" className="font-mono-tabular text-slate-900 mt-0.5 text-right">
                    {activeVersion.minAndroid}
                  </dd>
                </div>
              </dl>

              {/* Checksum */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    {app.scanStatus}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySha}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    {copiedHash ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedHash ? 'تم النسخ' : 'نسخ SHA-256'}</span>
                  </button>
                </div>
                <div
                  dir="ltr"
                  data-testid="modal-sha256"
                  className="font-mono-tabular rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 break-all select-all"
                >
                  {activeVersion.sha256}
                </div>
              </div>
            </div>

            {/* Direct APK Trigger */}
            <div className="space-y-2.5 pt-2">
              {lastDownloadedFilename && (
                <div
                  className="space-y-1 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>
                      بدأ التنزيل مباشرة من{' '}
                      <span dir="ltr" className="font-mono-tabular">
                        {lastDownloadedSource ?? activeVersion.sourceDomain}
                      </span>
                    </span>
                  </div>
                  <div dir="ltr" className="font-mono-tabular text-[11px] text-blue-800 truncate" data-testid="downloaded-filename">
                    {lastDownloadedFilename}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onStartDownload(app, activeVersion)}
                data-testid="modal-download-btn"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px] cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>
                  تحميل {formatDeviceLabel(activeVersion.targetDevice)} APK ({activeVersion.sizeMb} MB)
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleBookmark(app.id)}
                  aria-label={isBookmarked ? 'إزالة من المفضلة' : 'حفظ للمفضلة'}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors min-h-[40px] whitespace-nowrap cursor-pointer ${
                    isBookmarked
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 shrink-0 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'في المفضلة' : 'المفضلة'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveManifest}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px] whitespace-nowrap cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>ملف التحقق</span>
                </button>
              </div>

              {/* Official External Mirrors */}
              {app.mirrors.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    روابط الاستدعاء والتحميل المباشر:
                  </p>
                  <div className="space-y-1.5">
                    {app.mirrors.map((mirror) => (
                      <div
                        key={mirror.domain}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 whitespace-nowrap">
                            {mirror.label}
                          </div>
                          <div dir="ltr" className="font-mono-tabular text-[11px] text-slate-500 text-right">
                            {mirror.domain}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {mirror.downloadUrl && (
                            <button
                              type="button"
                              onClick={() => onStartDownload(app, activeVersion, mirror.domain)}
                              aria-label={`تحميل مباشر من ${mirror.domain}`}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <Download className="h-3 w-3" />
                              <span>تحميل</span>
                            </button>
                          )}
                          <a
                            href={mirror.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`فتح موقع ${mirror.domain}`}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
