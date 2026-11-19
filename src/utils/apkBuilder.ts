import { AppVersion, ModApp } from '../types/app';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value & 0xffff, true);
}

function writeUint32LE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

export interface ZipEntryInput {
  name: string;
  content: Uint8Array;
}

/**
 * Builds a valid uncompressed (STORE) ZIP archive byte array.
 * Android .apk files use the standard ZIP container format.
 */
export function buildZipArchive(entries: ZipEntryInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const localRecords: {
    nameBytes: Uint8Array;
    content: Uint8Array;
    crc: number;
    localHeaderOffset: number;
    localChunk: Uint8Array;
  }[] = [];

  let currentOffset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.content);
    const headerSize = 30 + nameBytes.length;
    const chunk = new Uint8Array(headerSize + entry.content.length);
    const view = new DataView(chunk.buffer);

    writeUint32LE(view, 0, 0x04034b50); // Local file header signature
    writeUint16LE(view, 4, 20); // Version needed to extract
    writeUint16LE(view, 6, 0x0800); // UTF-8 filename flag
    writeUint16LE(view, 8, 0); // Compression method: 0 (STORE)
    writeUint16LE(view, 10, 0); // Mod time
    writeUint16LE(view, 12, 0x5421); // Mod date
    writeUint32LE(view, 14, crc);
    writeUint32LE(view, 18, entry.content.length);
    writeUint32LE(view, 22, entry.content.length);
    writeUint16LE(view, 26, nameBytes.length);
    writeUint16LE(view, 28, 0); // Extra field length

    chunk.set(nameBytes, 30);
    chunk.set(entry.content, headerSize);

    localRecords.push({
      nameBytes,
      content: entry.content,
      crc,
      localHeaderOffset: currentOffset,
      localChunk: chunk,
    });
    currentOffset += chunk.length;
  }

  const centralDirOffset = currentOffset;
  const centralChunks: Uint8Array[] = [];
  let centralDirSize = 0;

  for (const rec of localRecords) {
    const cdSize = 46 + rec.nameBytes.length;
    const cd = new Uint8Array(cdSize);
    const view = new DataView(cd.buffer);

    writeUint32LE(view, 0, 0x02014b50); // Central directory header signature
    writeUint16LE(view, 4, 20); // Version made by
    writeUint16LE(view, 6, 20); // Version needed
    writeUint16LE(view, 8, 0x0800); // UTF-8
    writeUint16LE(view, 10, 0); // STORE
    writeUint16LE(view, 12, 0); // Mod time
    writeUint16LE(view, 14, 0x5421); // Mod date
    writeUint32LE(view, 16, rec.crc);
    writeUint32LE(view, 20, rec.content.length);
    writeUint32LE(view, 24, rec.content.length);
    writeUint16LE(view, 28, rec.nameBytes.length);
    writeUint16LE(view, 30, 0); // Extra length
    writeUint16LE(view, 32, 0); // Comment length
    writeUint16LE(view, 34, 0); // Disk number
    writeUint16LE(view, 36, 0); // Internal attrs
    writeUint32LE(view, 38, 0); // External attrs
    writeUint32LE(view, 42, rec.localHeaderOffset);

    cd.set(rec.nameBytes, 46);
    centralChunks.push(cd);
    centralDirSize += cd.length;
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  writeUint32LE(eocdView, 0, 0x06054b50); // EOCD signature
  writeUint16LE(eocdView, 4, 0);
  writeUint16LE(eocdView, 6, 0);
  writeUint16LE(eocdView, 8, localRecords.length);
  writeUint16LE(eocdView, 10, localRecords.length);
  writeUint32LE(eocdView, 12, centralDirSize);
  writeUint32LE(eocdView, 16, centralDirOffset);
  writeUint16LE(eocdView, 20, 0);

  const totalSize = currentOffset + centralDirSize + eocd.length;
  const output = new Uint8Array(totalSize);
  let pos = 0;

  for (const rec of localRecords) {
    output.set(rec.localChunk, pos);
    pos += rec.localChunk.length;
  }
  for (const cd of centralChunks) {
    output.set(cd, pos);
    pos += cd.length;
  }
  output.set(eocd, pos);

  return output;
}

export function buildApkFilename(app: ModApp, version: AppVersion): string {
  const safeName = app.englishName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const safeVersion = version.version
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safeName}-v${safeVersion}-AXIOS-TV.apk`;
}

export function buildApkPackageBytes(app: ModApp, version: AppVersion): Uint8Array {
  const encoder = new TextEncoder();

  const manifestXml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<manifest package="${app.packageId}" versionName="${version.version}" platform="AXIOS-TV">`,
    `  <uses-sdk minSdkVersion="${version.minAndroid}" />`,
    `  <application label="${app.englishName}" architecture="${version.architecture}" />`,
    '</manifest>',
  ].join('\n');

  const releaseMeta = JSON.stringify(
    {
      portal: 'AXIOS TV',
      appName: app.name,
      packageId: app.packageId,
      developer: app.developer,
      version: version.version,
      buildLabel: version.label,
      architecture: version.architecture,
      minAndroid: version.minAndroid,
      sha256: version.sha256,
      scanStatus: app.scanStatus,
      modFeatures: app.modFeatures,
      releasedAt: version.releasedAt,
    },
    null,
    2
  );

  const mfContent = [
    'Manifest-Version: 1.0',
    `Created-By: AXIOS TV Release Hub`,
    `Package-Id: ${app.packageId}`,
    `Package-Version: ${version.version}`,
    `SHA-256-Digest: ${version.sha256}`,
    '',
  ].join('\n');

  return buildZipArchive([
    { name: 'AndroidManifest.xml', content: encoder.encode(manifestXml) },
    { name: 'META-INF/MANIFEST.MF', content: encoder.encode(mfContent) },
    { name: 'assets/axios-tv-release.json', content: encoder.encode(releaseMeta) },
  ]);
}

export function triggerApkFileDownload(app: ModApp, version: AppVersion): string {
  const bytes = buildApkPackageBytes(app, version);
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/vnd.android.package-archive',
  });
  const filename = buildApkFilename(app, version);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return filename;
}
