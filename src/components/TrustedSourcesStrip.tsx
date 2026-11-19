import { Download, ExternalLink, Filter, Globe } from 'lucide-react';
import { TRUSTED_SOURCE_HUBS } from '../data/apps';
import { ProviderDomain } from '../types/app';

interface TrustedSourcesStripProps {
  selectedProvider: ProviderDomain;
  activeDownloadId: string | null;
  onSelectProvider: (provider: ProviderDomain) => void;
  onDirectDownloadHub: (appId: string, domain: string) => void;
}

export function TrustedSourcesStrip({
  selectedProvider,
  activeDownloadId,
  onSelectProvider,
  onDirectDownloadHub,
}: TrustedSourcesStripProps) {
  return (
    <section
      aria-label="مزودات التطبيقات الرسمية"
      className="border-b border-slate-200 bg-[#F5F6F8]"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              مزودات التطبيقات والتحميل المباشر (4 مصادر معتمدة)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              تصفّح حسب المزود أو ابدأ تحميل ملف APK مباشرة بضغطة واحدة
            </p>
          </div>
          {selectedProvider !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectProvider('all')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              عرض كل المزودين
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUSTED_SOURCE_HUBS.map((hub) => {
            const isActiveProvider = selectedProvider === hub.domain;
            const isJustTriggered = activeDownloadId === hub.featuredAppId;
            return (
              <div
                key={hub.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-4.5 transition-colors ${
                  isActiveProvider
                    ? 'border-blue-600 ring-1 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="h-4 w-4 shrink-0" style={{ color: hub.accentHex }} />
                      <span
                        dir="ltr"
                        className="font-mono-tabular text-sm font-bold text-slate-900 truncate"
                      >
                        {hub.domain}
                      </span>
                    </div>
                    <a
                      href={hub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`فتح موقع ${hub.domain}`}
                      className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 p-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">{hub.tagline}</p>
                  <p className="text-xs leading-relaxed text-slate-500 mb-4">{hub.description}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectProvider(isActiveProvider ? 'all' : hub.domain)
                    }
                    className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActiveProvider
                        ? 'text-blue-700'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    <span>{isActiveProvider ? 'مفعّل' : 'تصفية التطبيقات'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDirectDownloadHub(hub.featuredAppId, hub.domain)}
                    aria-label={`تحميل ${hub.directAppName} مباشرة من ${hub.domain}`}
                    data-testid={`hub-download-${hub.domain}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[36px]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isJustTriggered ? 'بدأ التحميل' : `تحميل ${hub.directAppName}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
