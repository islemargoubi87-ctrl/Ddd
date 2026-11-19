import test from 'node:test';
import assert from 'node:assert/strict';
import { MOD_APPS } from '../data/apps';
import { buildApkFilename, buildApkPackageBytes, crc32 } from './apkBuilder';

test('crc32 matches standard IEEE 802.3 checksum for known input', () => {
  const bytes = new TextEncoder().encode('123456789');
  assert.equal(crc32(bytes), 0xcbf43926);
});

test('buildApkPackageBytes generates a valid ZIP/APK binary with local header and EOCD', () => {
  const app = MOD_APPS[0];
  const version = app.versions[0];
  const bytes = buildApkPackageBytes(app, version);

  // Starts with PK\x03\x04 local file header signature
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  assert.equal(bytes[2], 0x03);
  assert.equal(bytes[3], 0x04);

  // Ends with PK\x05\x06 EOCD signature (22 bytes from end)
  const eocdStart = bytes.length - 22;
  assert.equal(bytes[eocdStart], 0x50);
  assert.equal(bytes[eocdStart + 1], 0x4b);
  assert.equal(bytes[eocdStart + 2], 0x05);
  assert.equal(bytes[eocdStart + 3], 0x06);

  // Contains AndroidManifest.xml and release metadata
  const text = new TextDecoder().decode(bytes);
  assert.ok(text.includes('AndroidManifest.xml'));
  assert.ok(text.includes(app.packageId));
  assert.ok(text.includes(version.sha256));
});

test('buildApkFilename produces clean sanitized .apk filename', () => {
  const app = MOD_APPS[0];
  const version = app.versions[0];
  const filename = buildApkFilename(app, version);
  assert.ok(filename.endsWith('.apk'));
  assert.ok(!filename.includes(' '));
});
