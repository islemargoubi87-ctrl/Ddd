import { useEffect, useMemo, useRef, useState } from 'react';
import { MOD_APPS } from './data/apps';
import {
  AppCategory,
  AppVersion,
  DevicePlatform,
  DownloadRecord,
  ModApp,
  ProviderDomain,
  SortOption,
} from './types/app';
import { filterAndSortApps } from './utils/catalog';
import { resolveDownloadSpec, triggerDirectServerDownload } from './utils/download';
import { useTvRemoteNavigation } from './hooks/useTvRemoteNavigation';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TrustedSourcesStrip } from './components/TrustedSourcesStrip';
import { CatalogSection } from './components/CatalogSection';
import { FdroidAndGuideSection } from './components/FdroidAndGuideSection';
import { ApkWrapperSection } from './components/ApkWrapperSection';
import { AppDetailModal } from './components/AppDetailModal';
import { DownloadsDrawer } from './components/DownloadsDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';

const STORAGE_KEYS = {
  downloads: 'axios_tv_downloads_v2',
  bookmarks: 'axios_tv_bookmarks_v2',
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function detectInitialTvMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('tv') === '1') return true;
  return /android tv|googletv|bravia|aftb|afts|shield/i.test(window.navigator.userAgent);
}

export default function App() {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<DevicePlatform>(() =>
    detectInitialTvMode() ? 'tv' : 'all'
  );
  const [provider, setProvider] = useState<ProviderDomain>('all');
  const [category, setCategory] = useState<AppCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('downloads');
  const [tvMode, setTvMode] = useState<boolean>(detectInitialTvMode);

  const [selectedApp, setSelectedApp] = useState<ModApp | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [downloads, setDownloads] = useState<DownloadRecord[]>(() =>
    readStorage<DownloadRecord[]>(STORAGE_KEYS.downloads, [])
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.bookmarks, [])
  );

  const [activeDownloadKey, setActiveDownloadKey] = useState<string | null>(null);
  const [activeDownloadAppId, setActiveDownloadAppId] = useState<string | null>(null);
  const [lastDownloadedFilename, setLastDownloadedFilename] = useState<string | null>(null);
  const [lastDownloadedSource, setLastDownloadedSource] = useState<string | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useTvRemoteNavigation(tvMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.downloads, JSON.stringify(downloads));
    } catch {
      // ignore storage quota errors
    }
  }, [downloads]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const filteredApps = useMemo(
    () => filterAndSortApps(MOD_APPS, { query, platform, provider, category, sortBy }),
    [query, platform, provider, category, sortBy]
  );

  const phoneAppsCount = useMemo(
    () => MOD_APPS.filter((app) => app.platforms.includes('phone')).length,
    []
  );

  const tvAppsCount = useMemo(
    () => MOD_APPS.filter((app) => app.platforms.includes('tv')).length,
    []
  );

  const bookmarkedApps = useMemo(
    () => MOD_APPS.filter((app) => bookmarkedIds.includes(app.id)),
    [bookmarkedIds]
  );

  const handleToggleBookmark = (appId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [appId, ...prev]
    );
  };

  const handleToggleTvMode = () => {
    setTvMode((prev) => {
      const next = !prev;
      if (next) {
        setPlatform('tv');
      }
      return next;
    });
  };

  const handleStartDownload = (
    app: ModApp,
    explicitVersion?: AppVersion,
    mirrorDomain?: string
  ) => {
    const version = explicitVersion ?? app.versions[0];
    const spec = resolveDownloadSpec(MOD_APPS, app.id, version.id, mirrorDomain);
    if (!spec) return;

    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    triggerDirectServerDownload(spec.apiUrl, spec.filename);

    setActiveDownloadAppId(app.id);
    setActiveDownloadKey(`${app.id}:${version.id}`);
    setLastDownloadedFilename(spec.filename);
    setLastDownloadedSource(spec.sourceDomain);

    const newRecord: DownloadRecord = {
      id: `${app.id}-${version.id}-${Date.now()}`,
      appId: app.id,
      appName: app.name,
      englishName: app.englishName,
      version: version.version,
      targetDevice: version.targetDevice,
      sizeMb: version.sizeMb,
      sha256: version.sha256,
      downloadedAt: new Date().toISOString(),
      accentHex: app.accentHex,
      iconGlyph: app.iconGlyph,
      sourceDomain: spec.sourceDomain,
    };

    setDownloads((prev) => {
      const withoutDuplicate = prev.filter(
        (d) => !(d.appId === app.id && d.version === version.version)
      );
      return [newRecord, ...withoutDuplicate];
    });

    feedbackTimerRef.current = window.setTimeout(() => {
      setActiveDownloadAppId(null);
      setActiveDownloadKey(null);
      feedbackTimerRef.current = null;
    }, 1800);
  };

  const handleDirectDownloadByHub = (appId: string, domain: string) => {
    const app = MOD_APPS.find((item) => item.id === appId);
    if (!app) return;
    handleStartDownload(app, app.versions[0], domain);
  };

  const handleRedownloadFromDrawer = (record: DownloadRecord) => {
    const app = MOD_APPS.find((a) => a.id === record.appId);
    if (!app) return;
    const version =
      app.versions.find((v) => v.version === record.version) ?? app.versions[0];
    const spec = resolveDownloadSpec(MOD_APPS, app.id, version.id, record.sourceDomain);
    if (!spec) return;
    triggerDirectServerDownload(spec.apiUrl, spec.filename);
  };

  const handleOpenDetails = (app: ModApp) => {
    setLastDownloadedFilename(null);
    setLastDownloadedSource(null);
    setSelectedApp(app);
  };

  const handleOpenAppById = (appId: string) => {
    const found = MOD_APPS.find((app) => app.id === appId);
    if (found) {
      handleOpenDetails(found);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setPlatform('all');
    setProvider('all');
    setCategory('all');
    setSortBy('downloads');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8] text-slate-900">
      <Header
        savedAndDownloadedCount={downloads.length + bookmarkedIds.length}
        tvMode={tvMode}
        onOpenDrawer={() => setDrawerOpen(true)}
        onToggleTvMode={handleToggleTvMode}
        onSelectPlatform={setPlatform}
        onSelectProvider={setProvider}
      />

      <main className="flex-1">
        <HeroSection
          platform={platform}
          totalAppsCount={MOD_APPS.length}
          phoneAppsCount={phoneAppsCount}
          tvAppsCount={tvAppsCount}
          onSelectPlatform={setPlatform}
        />

        <TrustedSourcesStrip
          selectedProvider={provider}
          activeDownloadId={activeDownloadAppId}
          onSelectProvider={setProvider}
          onDirectDownloadHub={handleDirectDownloadByHub}
        />

        <CatalogSection
          apps={filteredApps}
          totalCatalogCount={MOD_APPS.length}
          query={query}
          platform={platform}
          provider={provider}
          category={category}
          sortBy={sortBy}
          bookmarkedIds={bookmarkedIds}
          activeDownloadKey={activeDownloadKey}
          onQueryChange={setQuery}
          onPlatformChange={setPlatform}
          onProviderChange={setProvider}
          onCategoryChange={setCategory}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          onOpenDetails={handleOpenDetails}
          onStartDownload={handleStartDownload}
          onToggleBookmark={handleToggleBookmark}
        />

        <FdroidAndGuideSection />

        <ApkWrapperSection tvMode={tvMode} onToggleTvMode={handleToggleTvMode} />
      </main>

      <Footer onSelectPlatform={setPlatform} onSelectProvider={setProvider} />

      <AppDetailModal
        app={selectedApp}
        isBookmarked={selectedApp ? bookmarkedIds.includes(selectedApp.id) : false}
        lastDownloadedFilename={lastDownloadedFilename}
        lastDownloadedSource={lastDownloadedSource}
        onClose={() => {
          setSelectedApp(null);
          setLastDownloadedFilename(null);
          setLastDownloadedSource(null);
        }}
        onStartDownload={handleStartDownload}
        onToggleBookmark={handleToggleBookmark}
      />

      <DownloadsDrawer
        open={drawerOpen}
        downloads={downloads}
        bookmarkedApps={bookmarkedApps}
        onClose={() => setDrawerOpen(false)}
        onOpenApp={handleOpenAppById}
        onRedownload={handleRedownloadFromDrawer}
        onRemoveDownload={(id) => setDownloads((prev) => prev.filter((d) => d.id !== id))}
        onClearDownloads={() => setDownloads([])}
        onRemoveBookmark={handleToggleBookmark}
      />

      <OfflineIndicator />
    </div>
  );
}
