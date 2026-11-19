import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAndroidProjectFiles,
  buildAndroidProjectZip,
  DEFAULT_WRAPPER_URL,
  sanitizeWrapperUrl,
} from './androidProjectGenerator';

test('sanitizeWrapperUrl accepts valid http/https URLs and falls back safely', () => {
  assert.equal(sanitizeWrapperUrl('https://example.com///'), 'https://example.com');
  assert.equal(sanitizeWrapperUrl('http://localhost:3000/'), 'http://localhost:3000');
  assert.equal(sanitizeWrapperUrl('javascript:alert(1)'), DEFAULT_WRAPPER_URL);
  assert.equal(sanitizeWrapperUrl(''), DEFAULT_WRAPPER_URL);
});

test('buildAndroidProjectFiles outputs dual Phone & Android TV Gradle project with Leanback & DownloadManager', () => {
  const files = buildAndroidProjectFiles('https://axios-tv.example.app/');
  const names = files.map((f) => f.name);

  assert.ok(names.some((n) => n.endsWith('/app/build.gradle.kts')));
  assert.ok(names.some((n) => n.endsWith('/AndroidManifest.xml')));
  assert.ok(names.some((n) => n.endsWith('/MainActivity.kt')));
  assert.ok(names.some((n) => n.endsWith('/.github/workflows/build-apk.yml')));

  const manifest = new TextDecoder().decode(
    files.find((f) => f.name.endsWith('/AndroidManifest.xml'))!.content
  );
  assert.ok(manifest.includes('android.intent.category.LAUNCHER'));
  assert.ok(manifest.includes('android.intent.category.LEANBACK_LAUNCHER'));
  assert.ok(manifest.includes('android.permission.REQUEST_INSTALL_PACKAGES'));

  const gradle = new TextDecoder().decode(
    files.find((f) => f.name.endsWith('/app/build.gradle.kts'))!.content
  );
  assert.ok(gradle.includes('create("phone")'));
  assert.ok(gradle.includes('create("tv")'));
  assert.ok(gradle.includes('https://axios-tv.example.app'));

  const kotlin = new TextDecoder().decode(
    files.find((f) => f.name.endsWith('/MainActivity.kt'))!.content
  );
  assert.ok(kotlin.includes('DownloadManager.Request'));
  assert.ok(kotlin.includes('FEATURE_LEANBACK'));
});

test('buildAndroidProjectZip produces a valid ZIP archive with EOCD signature', () => {
  const zipBytes = buildAndroidProjectZip('https://axios-tv.example.app');
  assert.equal(zipBytes[0], 0x50);
  assert.equal(zipBytes[1], 0x4b);
  assert.equal(zipBytes[2], 0x03);
  assert.equal(zipBytes[3], 0x04);

  const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  const eocdSig = view.getUint32(zipBytes.length - 22, true);
  assert.equal(eocdSig, 0x06054b50);
});
