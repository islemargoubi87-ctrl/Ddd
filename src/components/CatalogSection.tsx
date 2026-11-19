import { Search, Smartphone, Tv, X } from 'lucide-react';
import {
  AppCategory,
  AppVersion,
  DevicePlatform,
  ModApp,
  ProviderDomain,
  SortOption,
} from '../types/app';
import { AppCard } from './AppCard';

interface CatalogSectionProps {
  apps: ModApp[];
  totalCatalogCount: number;
  query: string;
  platform: DevicePlatform;
  provider: ProviderDomain;
  category: AppCategory;
  sortBy: SortOption;
  bookmarkedIds: string[];
  activeDownloadKey: string | null;
  onQueryChange: (value: string) => void;
  onPlatformChange: (platform: DevicePlatform) => void;
  onProviderChange: (provider: ProviderDomain) => void;
  onCategoryChange: (cat: AppCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onOpenDetails: (app: ModApp) => void;
  onStartDownload: (app: ModApp, version: AppVersion) => void;
  onToggleBookmark: (appId: string) => void;
}

const PLATFORM_OPTIONS: { id: DevicePlatform; label: string }[] = [
  { id: 'all', label: 'الكل (الهاتف + التلفاز)' },
  { id: 'phone', label: 'تطبيقات الهاتف APK' },
  { id: 'tv', label: 'تطبيقات التلفاز Android TV' },
];

const PROVIDER_OPTIONS: { id: ProviderDomain; label: string }[] = [
  { id: 'all', label: 'جميع المزودين' },
  { id: 'f-droid.org', label: 'F-Droid (f-droid.org)' },
  { id: 'netmirror.gg', label: 'NetMirror (netmirror.gg)' },
  { id: 'netflyapp.com', label: 'Netfly (netflyapp.com)' },
  { id: 'app.apkmb.com', label: 'APKMB (app.apkmb.com)' },
];

const CATEGORY_TABS: { id: AppCategory; label: string }[] = [
  { id: 'all', label: 'كل التصنيفات' },
  { id: 'streaming', label: 'البث والقنوات' },
  { id: 'players', label: 'المشغلات والوسائط' },
  { id: 'tv-tools', label: 'أدوات الهاتف والتلفاز' },
];

export function CatalogSection({
  apps,
  totalCatalogCount,
  query,
  platform,
  provider,
  category,
  sortBy,
  bookmarkedIds,
  activeDownloadKey,
  onQueryChange,
  onPlatformChange,
  onProviderChange,
  onCategoryChange,
  onSortChange,
  onResetFilters,
  onOpenDetails,
  onStartDownload,
  onToggleBookmark,
}: CatalogSectionProps) {
  return (
    <section id="catalog" className="scroll-mt-24 py-10 lg:py-14 bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Top Bar Heading + Search + Sort */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              دليل حزم APK للهاتف والتلفاز
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              عرض <span className="font-mono-tabular font-semibold text-slate-900">{apps.length}</span>{' '}
              من أصل{' '}
              <span className="font-mono-tabular font-semibold text-slate-900">
                {totalCatalogCount}
              </span>{' '}
              تطبيق حقيقي جاهز للتحميل الفوري
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative sm:w-80">
              <label htmlFor="catalog-search" className="sr-only">
                ابحث عن تطبيق أو حزمة APK
              </label>
              <Search
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="ابحث باسم التطبيق، F-Droid، أو الحزمة..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="مسح البحث"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="catalog-sort" className="sr-only">
                ترتيب النتائج
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none min-h-[44px] cursor-pointer"
              >
                <option value="downloads">الأكثر تحميلاً</option>
                <option value="newest">الأحدث تحديثاً</option>
                <option value="size">الأصغر حجماً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workspace Split: Sidebar Filters + 2-Column App Grid */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 items-start">
          {/* Filter Rail Sidebar */}
          <aside
            aria-label="فلاتر المنصة والمزود"
            className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4.5 space-y-5 lg:sticky lg:top-20"
          >
            {/* Device Platform Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 mb-2.5">حسب الجهاز</h3>
              <div className="space-y-1.5" role="group" aria-label="تصفية حسب الجهاز">
                {PLATFORM_OPTIONS.map((opt) => {
                  const active = platform === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onPlatformChange(opt.id)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {opt.id === 'phone' && <Smartphone className="h-3.5 w-3.5" />}
                        {opt.id === 'tv' && <Tv className="h-3.5 w-3.5" />}
                        <span>{opt.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 mb-2.5">حسب مزود التطبيقات</h3>
              <div className="space-y-1.5" role="group" aria-label="تصفية حسب المزود">
                {PROVIDER_OPTIONS.map((opt) => {
                  const active = provider === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onProviderChange(opt.id)}
                      data-testid={`filter-provider-${opt.id}`}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[40px] text-right ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span dir={opt.id === 'all' ? 'rtl' : 'ltr'} className="truncate">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 mb-2.5">حسب التصنيف</h3>
              <div className="space-y-1.5" role="tablist" aria-label="تصنيفات التطبيقات">
                {CATEGORY_TABS.map((tab) => {
                  const active = category === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onCategoryChange(tab.id)}
                      className={`w-full rounded-lg px-3 py-2 text-xs font-semibold text-right transition-colors cursor-pointer min-h-[40px] ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(query || platform !== 'all' || provider !== 'all' || category !== 'all') && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[40px]"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </aside>

          {/* 2-Column Spacious APK Cards Grid */}
          <div className="lg:col-span-9">
            {apps.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  لا توجد حزم APK مطابقة للفلتر الحالي
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  جرّب مسح البحث أو إعادة تعيين خيارات الجهاز والمزود لعرض كل التطبيقات المتاحة.
                </p>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer min-h-[44px]"
                >
                  عرض جميع التطبيقات ({totalCatalogCount})
                </button>
              </div>
            ) : (
              <div
                data-testid="apps-grid"
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                {apps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    isBookmarked={bookmarkedIds.includes(app.id)}
                    activeDownloadKey={activeDownloadKey}
                    onOpenDetails={onOpenDetails}
                    onStartDownload={onStartDownload}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
