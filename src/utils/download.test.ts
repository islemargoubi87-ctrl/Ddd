import test from 'node:test';
import assert from 'node:assert/strict';
import { MOD_APPS, TRUSTED_SOURCE_HUBS } from '../data/apps';
import {
  buildApiDownloadUrl,
  buildFdroidApiDownloadUrl,
  extractDomainFromUrl,
  resolveDownloadSpec,
} from './download';

test('resolveDownloadSpec maps Phone, TV, and all 4 providers directly to verified upstream APK URLs', () => {
  const netmirrorPhone = resolveDownloadSpec(MOD_APPS, 'netmirror', 'v3.4.2-phone');
  assert.ok(netmirrorPhone);
  assert.equal(netmirrorPhone.upstreamUrl, 'https://netmirror.gg/NetMirror.apk');
  assert.equal(netmirrorPhone.sourceDomain, 'netmirror.gg');

  const netmirrorTv = resolveDownloadSpec(MOD_APPS, 'netmirror', 'v3.3.0-tv');
  assert.ok(netmirrorTv);
  assert.equal(netmirrorTv.upstreamUrl, 'https://netmirror.gg/NetMirrorTV.apk');
  assert.ok(netmirrorTv.filename.includes('-TV.apk'));

  const netflyTv = resolveDownloadSpec(MOD_APPS, 'netfly', 'v5.1.0-tv');
  assert.ok(netflyTv);
  assert.equal(netflyTv.upstreamUrl, 'https://netflyapp.com/file/netfly_tv.apk');
  assert.equal(netflyTv.sourceDomain, 'netflyapp.com');

  const fdroidSpec = resolveDownloadSpec(MOD_APPS, 'fdroid');
  assert.ok(fdroidSpec);
  assert.equal(fdroidSpec.upstreamUrl, 'https://f-droid.org/F-Droid.apk');
  assert.equal(fdroidSpec.sourceDomain, 'f-droid.org');

  const vlcSpec = resolveDownloadSpec(MOD_APPS, 'vlc');
  assert.ok(vlcSpec);
  assert.equal(vlcSpec.upstreamUrl, 'https://f-droid.org/repo/org.videolan.vlc_13070208.apk');
});

test('all 4 trusted source hubs including F-Droid resolve cleanly to downloadable apps', () => {
  assert.equal(TRUSTED_SOURCE_HUBS.length, 4);
  for (const hub of TRUSTED_SOURCE_HUBS) {
    const spec = resolveDownloadSpec(MOD_APPS, hub.featuredAppId, undefined, hub.domain);
    assert.ok(spec, `Expected spec for hub ${hub.domain}`);
    assert.ok(spec.upstreamUrl.startsWith('https://'));
  }
});

test('buildFdroidApiDownloadUrl, buildApiDownloadUrl, and extractDomainFromUrl format safely', () => {
  assert.equal(
    buildFdroidApiDownloadUrl('org.videolan.vlc', 13070208),
    '/api/fdroid/download?pkg=org.videolan.vlc&versionCode=13070208'
  );
  assert.equal(
    buildApiDownloadUrl('netfly', 'v5.1.0-tv', 'netflyapp.com'),
    '/api/download?appId=netfly&versionId=v5.1.0-tv&mirror=netflyapp.com'
  );
  assert.equal(extractDomainFromUrl('https://f-droid.org/F-Droid.apk'), 'f-droid.org');
  assert.equal(resolveDownloadSpec(MOD_APPS, 'unknown-id'), null);
});
