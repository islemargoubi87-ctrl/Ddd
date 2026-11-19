import { AppVersion, ModApp } from '../types/app';
import { buildApkFilename } from './apkBuilder';
import { getSelectedVersion } from './catalog';

export interface ResolvedDownloadSpec {
  app: ModApp;
  version: AppVersion;
  filename: string;
  upstreamUrl: string;
  sourceDomain: string;
  apiUrl: string;
}

export function extractDomainFromUrl(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return 'axios-tv.local';
  }
}

export function buildApiDownloadUrl(
  appId: string,
  versionId: string,
  mirrorDomain?: string
): string {
  const params = new URLSearchParams({
    appId,
    versionId,
  });
  if (mirrorDomain) {
    params.set('mirror', mirrorDomain);
  }
  return `/api/download?${params.toString()}`;
}

export function buildFdroidApiDownloadUrl(packageName: string, versionCode: number): string {
  const params = new URLSearchParams({
    pkg: packageName,
    versionCode: String(versionCode),
  });
  return `/api/fdroid/download?${params.toString()}`;
}

export function resolveDownloadSpec(
  apps: ModApp[],
  appId: string,
  versionId?: string,
  mirrorDomain?: string
): ResolvedDownloadSpec | null {
  const app = apps.find((item) => item.id === appId);
  if (!app) {
    return null;
  }

  const version = getSelectedVersion(app, versionId);
  const matchingMirror = mirrorDomain
    ? app.mirrors.find((m) => m.domain === mirrorDomain && Boolean(m.downloadUrl))
    : undefined;

  const upstreamUrl = matchingMirror?.downloadUrl ?? version.downloadUrl;
  const sourceDomain =
    matchingMirror?.domain ?? version.sourceDomain ?? extractDomainFromUrl(upstreamUrl);

  const deviceSuffix = version.targetDevice === 'tv' ? '-TV' : '';
  const baseFilename = buildApkFilename(app, version);
  const filename =
    deviceSuffix && !baseFilename.includes('-TV')
      ? baseFilename.replace(/\.apk$/, `${deviceSuffix}.apk`)
      : baseFilename;

  const apiUrl = buildApiDownloadUrl(app.id, version.id, matchingMirror?.domain);

  return {
    app,
    version,
    filename,
    upstreamUrl,
    sourceDomain,
    apiUrl,
  };
}

export function triggerDirectServerDownload(apiUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = apiUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
