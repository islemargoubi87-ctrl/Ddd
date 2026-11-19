import {
  AppCategory,
  AppVersion,
  DevicePlatform,
  ModApp,
  ProviderDomain,
  SortOption,
} from '../types/app';

export interface CatalogFilterOptions {
  query: string;
  platform: DevicePlatform;
  provider: ProviderDomain;
  category: AppCategory;
  sortBy: SortOption;
}

export function filterAndSortApps(apps: ModApp[], options: CatalogFilterOptions): ModApp[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = apps.filter((app) => {
    const matchesPlatform =
      options.platform === 'all' || app.platforms.includes(options.platform);
    if (!matchesPlatform) {
      return false;
    }

    const matchesProvider =
      options.provider === 'all' ||
      app.providerDomain === options.provider ||
      app.mirrors.some((m) => m.domain === options.provider);
    if (!matchesProvider) {
      return false;
    }

    const matchesCategory = options.category === 'all' || app.category === options.category;
    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      app.name,
      app.englishName,
      app.packageId,
      app.developer,
      app.providerDomain,
      app.shortTagline,
      app.modSummary,
      app.categoryLabel,
      ...app.modFeatures,
    ]
      .join(' ')
      .toLowerCase();

    if (haystack.includes(normalizedQuery)) {
      return true;
    }

    const compactQuery = normalizedQuery.replace(/\s+/g, '');
    const compactHaystack = haystack.replace(/\s+/g, '');
    return compactQuery.length > 0 && compactHaystack.includes(compactQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (options.sortBy === 'downloads') {
      return b.downloadsCount - a.downloadsCount;
    }
    if (options.sortBy === 'size') {
      return (a.versions[0]?.sizeMb ?? 0) - (b.versions[0]?.sizeMb ?? 0);
    }
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return sorted;
}

export interface DeviceVersionSplit {
  phoneVersion: AppVersion | null;
  tvVersion: AppVersion | null;
  primaryVersion: AppVersion;
}

export function getPhoneAndTvVersions(app: ModApp): DeviceVersionSplit {
  const phoneVersion = app.versions.find((v) => v.targetDevice === 'phone') ?? null;
  const tvVersion = app.versions.find((v) => v.targetDevice === 'tv') ?? null;
  const primaryVersion = app.versions[0];
  return { phoneVersion, tvVersion, primaryVersion };
}

export function getSelectedVersion(app: ModApp, versionId?: string): AppVersion {
  if (!versionId) {
    return app.versions[0];
  }
  return app.versions.find((v) => v.id === versionId) ?? app.versions[0];
}

export function formatDownloadCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  return String(count);
}

export function formatDeviceLabel(device: AppVersion['targetDevice']): string {
  if (device === 'phone') return 'الهاتف';
  if (device === 'tv') return 'التلفاز TV';
  return 'الهاتف والتلفاز';
}

export function buildPackageManifestText(app: ModApp, version: AppVersion): string {
  return [
    '====================================================',
    'AXIOS TV — Phone & Android TV APK Release Manifest',
    '====================================================',
    `App Name       : ${app.name}`,
    `Package ID     : ${app.packageId}`,
    `Provider       : ${version.sourceDomain}`,
    `Target Device  : ${version.targetDevice}`,
    `Version        : ${version.version}`,
    `Build Label    : ${version.label}`,
    `Architecture   : ${version.architecture}`,
    `Min Android OS : ${version.minAndroid}`,
    `File Size      : ${version.sizeMb.toFixed(1)} MB`,
    `Release Date   : ${version.releasedAt}`,
    `Direct Source  : ${version.downloadUrl}`,
    `SHA-256        : ${version.sha256}`,
    '',
    'Highlights:',
    ...app.modFeatures.map((feat, i) => `  ${i + 1}. ${feat}`),
    '====================================================',
  ].join('\n');
}
