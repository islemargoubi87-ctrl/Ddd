import test from 'node:test';
import assert from 'node:assert/strict';
import { MOD_APPS, TRUSTED_SOURCE_HUBS } from '../data/apps';
import {
  buildPackageManifestText,
  filterAndSortApps,
  formatDeviceLabel,
  formatDownloadCount,
  getPhoneAndTvVersions,
  getSelectedVersion,
} from './catalog';

test('catalog contains only real apps with direct HTTPS download URLs across Phone, TV, and 4 providers including F-Droid', () => {
  const hubDomains = new Set(TRUSTED_SOURCE_HUBS.map((h) => h.domain));
  assert.ok(hubDomains.has('netmirror.gg'));
  assert.ok(hubDomains.has('netflyapp.com'));
  assert.ok(hubDomains.has('app.apkmb.com'));
  assert.ok(hubDomains.has('f-droid.org'));

  assert.equal(MOD_APPS.some((a) => a.id === 'axios-cinema-tv'), false);
  assert.equal(MOD_APPS.some((a) => a.id === 'lumina-cut-pro'), false);

  for (const app of MOD_APPS) {
    assert.ok(app.platforms.length >= 1, `${app.id} must specify phone/tv platforms`);
    assert.ok(app.versions.length >= 1, `${app.id} must have at least one version`);
    for (const ver of app.versions) {
      assert.ok(ver.downloadUrl.startsWith('https://'), `${app.id} ${ver.id} needs HTTPS downloadUrl`);
    }
  }
});

test('filterAndSortApps filters by platform (phone/tv), provider (f-droid.org), category, and search query', () => {
  const tvOnly = filterAndSortApps(MOD_APPS, {
    query: '',
    platform: 'tv',
    provider: 'all',
    category: 'all',
    sortBy: 'downloads',
  });
  assert.ok(tvOnly.some((a) => a.id === 'moviebox-tv'));
  assert.ok(tvOnly.some((a) => a.id === 'atv-launcher-pro'));
  assert.ok(tvOnly.every((a) => a.platforms.includes('tv')));

  const fdroidApps = filterAndSortApps(MOD_APPS, {
    query: '',
    platform: 'all',
    provider: 'f-droid.org',
    category: 'all',
    sortBy: 'downloads',
  });
  assert.ok(fdroidApps.length >= 5);
  assert.ok(fdroidApps.some((a) => a.id === 'fdroid'));
  assert.ok(fdroidApps.some((a) => a.id === 'vlc'));
  assert.ok(fdroidApps.some((a) => a.id === 'kodi'));

  const bySpacedName = filterAndSortApps(MOD_APPS, {
    query: 'Net mirror',
    platform: 'all',
    provider: 'all',
    category: 'all',
    sortBy: 'newest',
  });
  assert.equal(bySpacedName.length, 1);
  assert.equal(bySpacedName[0].id, 'netmirror');
});

test('getPhoneAndTvVersions exposes separate Phone and TV APK builds for dual-platform apps', () => {
  const netmirror = MOD_APPS.find((a) => a.id === 'netmirror');
  assert.ok(netmirror);
  const split = getPhoneAndTvVersions(netmirror);
  assert.equal(split.phoneVersion?.downloadUrl, 'https://netmirror.gg/NetMirror.apk');
  assert.equal(split.tvVersion?.downloadUrl, 'https://netmirror.gg/NetMirrorTV.apk');

  const netfly = MOD_APPS.find((a) => a.id === 'netfly');
  assert.ok(netfly);
  const netflySplit = getPhoneAndTvVersions(netfly);
  assert.equal(netflySplit.phoneVersion?.downloadUrl, 'https://netflyapp.com/file/netfly_mobile.apk');
  assert.equal(netflySplit.tvVersion?.downloadUrl, 'https://netflyapp.com/file/netfly_tv.apk');
});

test('getSelectedVersion, formatDownloadCount, formatDeviceLabel, and buildPackageManifestText work cleanly', () => {
  const app = MOD_APPS[0];
  assert.equal(getSelectedVersion(app, 'missing').id, app.versions[0].id);
  assert.equal(formatDownloadCount(850), '850');
  assert.equal(formatDownloadCount(184200), '184K');
  assert.equal(formatDeviceLabel('phone'), 'الهاتف');
  assert.equal(formatDeviceLabel('tv'), 'التلفاز TV');
  assert.equal(formatDeviceLabel('universal'), 'الهاتف والتلفاز');

  const manifest = buildPackageManifestText(app, app.versions[0]);
  assert.ok(manifest.includes(app.packageId));
  assert.ok(manifest.includes(app.versions[0].downloadUrl));
});
