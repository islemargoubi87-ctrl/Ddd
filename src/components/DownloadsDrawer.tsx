import { useEffect, useState } from 'react';
import { Bookmark, Download, Trash2, X } from 'lucide-react';
import { DownloadRecord, ModApp } from '../types/app';
import { formatDeviceLabel } from '../utils/catalog';
import { AppIcon } from './AppIcon';

interface DownloadsDrawerProps {
  open: boolean;
  downloads: DownloadRecord[];
  bookmarkedApps: ModApp[];
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onRedownload: (record: DownloadRecord) => void;
  onRemoveDownload: (downloadId: string) => void;
  onClearDownloads: () => void;
  onRemoveBookmark: (appId: string) => void;
}

export function DownloadsDrawer({
  open,
  downloads,
  bookmarkedApps,
  onClose,
  onOpenApp,
  onRedownload,
  onRemoveDownload,
  onClearDownloads,
  onRemoveBookmark,
}: DownloadsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'downloads' | 'bookmarks'>('downloads');

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="إدارة التنزيلات والمحفوظات"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <aside className="flex h-full w-full max-w-md flex-col border-r border-slate-200 bg-white shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">التنزيلات والمحفوظات</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة التنزيلات"
            className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:text-slate-900 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('downloads')}
              className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
                activeTab === 'downloads'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              سجل التنزيلات ({downloads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
                activeTab === 'bookmarks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المفضلة ({bookmarkedApps.length})
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'downloads' ? (
            downloads.length === 0 ? (
              <div className="py-12 text-center">
                <Download className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-800 mb-1">لا توجد تنزيلات مسجلة بعد</p>
                <p className="text-xs text-slate-500">
                  عند الضغط على زر تحميل الهاتف أو التلفاز سيبدأ تنزيل الـ APK مباشرة ويُسجّل هنا.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="downloads-list">
                {downloads.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AppIcon
                        appId={item.appId}
                        accentHex={item.accentHex}
                        glyph={item.iconGlyph}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenApp(item.appId);
                            onClose();
                          }}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate block text-right cursor-pointer"
                        >
                          {item.appName}
                        </button>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-700">
                            {formatDeviceLabel(item.targetDevice)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span dir="ltr" className="font-mono-tabular">
                            v{item.version}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span dir="ltr" className="font-mono-tabular text-blue-600">
                            {item.sourceDomain}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRedownload(item)}
                        aria-label={`إعادة تنزيل ${item.appName}`}
                        className="rounded-md p-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDownload(item.id)}
                        aria-label={`إزالة ${item.appName} من سجل التنزيلات`}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : bookmarkedApps.length === 0 ? (
            <div className="py-12 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-800 mb-1">قائمة المفضلة فارغة</p>
              <p className="text-xs text-slate-500">
                اضغط على أيقونة الحفظ في أي بطاقة تطبيق للرجوع إليه لاحقاً بسرعة.
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="bookmarks-list">
              {bookmarkedApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AppIcon
                      appId={app.id}
                      accentHex={app.accentHex}
                      glyph={app.iconGlyph}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenApp(app.id);
                          onClose();
                        }}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate block text-right cursor-pointer"
                      >
                        {app.name}
                      </button>
                      <p className="text-xs text-slate-500 truncate">
                        {app.providerDomain} · v{app.versions[0].version}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(app.id)}
                    aria-label={`إزالة ${app.name} من المفضلة`}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action */}
        {activeTab === 'downloads' && downloads.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={onClearDownloads}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] cursor-pointer"
            >
              مسح سجل التنزيلات بالكامل
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
