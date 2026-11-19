export type DevicePlatform = 'all' | 'phone' | 'tv';

export type ProviderDomain =
  | 'all'
  | 'netmirror.gg'
  | 'netflyapp.com'
  | 'app.apkmb.com'
  | 'f-droid.org';

export type AppCategory = 'all' | 'streaming' | 'players' | 'tv-tools';

export type SortOption = 'downloads' | 'newest' | 'size';

export interface AppMirror {
  label: string;
  domain: string;
  url: string;
  downloadUrl?: string;
}

export interface AppVersion {
  id: string;
  version: string;
  label: string;
  targetDevice: 'phone' | 'tv' | 'universal';
  sizeMb: number;
  architecture: string;
  minAndroid: string;
  sha256: string;
  releasedAt: string;
  changelog: string;
  downloadUrl: string;
  sourceDomain: string;
}

export interface ModApp {
  id: string;
  name: string;
  englishName: string;
  packageId: string;
  developer: string;
  providerDomain: Exclude<ProviderDomain, 'all'>;
  platforms: ('phone' | 'tv')[];
  category: Exclude<AppCategory, 'all'>;
  categoryLabel: string;
  shortTagline: string;
  modSummary: string;
  description: string;
  modFeatures: string[];
  rating: number;
  downloadsCount: number;
  updatedAt: string;
  featured?: boolean;
  accentHex: string;
  iconGlyph: string;
  scanStatus: string;
  mirrors: AppMirror[];
  versions: AppVersion[];
}

export interface DownloadRecord {
  id: string;
  appId: string;
  appName: string;
  englishName: string;
  version: string;
  targetDevice: 'phone' | 'tv' | 'universal';
  sizeMb: number;
  sha256: string;
  downloadedAt: string;
  accentHex: string;
  iconGlyph: string;
  sourceDomain: string;
}
