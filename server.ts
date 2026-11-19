import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { MOD_APPS } from './src/data/apps.ts';
import { buildAndroidProjectZip, sanitizeWrapperUrl } from './src/utils/androidProjectGenerator.ts';
import { buildApkPackageBytes } from './src/utils/apkBuilder.ts';
import { resolveDownloadSpec } from './src/utils/download.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const PACKAGE_ID_REGEX = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/;

async function proxyApkStream(
  req: express.Request,
  res: express.Response,
  upstreamUrl: string,
  filename: string,
  sourceDomain: string,
  fallback?: () => Uint8Array
) {
  const encodedName = encodeURIComponent(filename);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodedName}`
  );
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Axios-Source-Domain', sourceDomain);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);
  req.on('close', () => {
    clearTimeout(timeoutId);
    controller.abort();
  });

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 13; AXIOS TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        Accept: 'application/vnd.android.package-archive,application/octet-stream,*/*',
      },
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      const contentLength = upstreamRes.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      if (req.method === 'HEAD') {
        res.status(200).end();
        return;
      }

      if (upstreamRes.body) {
        const nodeStream = Readable.fromWeb(
          upstreamRes.body as unknown as NodeWebReadableStream<Uint8Array>
        );
        nodeStream.on('error', () => {
          if (!res.writableEnded) {
            res.end();
          }
        });
        nodeStream.pipe(res);
        return;
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }

  if (fallback) {
    const fallbackBytes = Buffer.from(fallback());
    res.setHeader('Content-Length', String(fallbackBytes.length));
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }
    res.status(200).send(fallbackBytes);
    return;
  }

  res.status(502).json({ error: 'Upstream APK unavailable' });
}

async function startServer() {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'axios-tv' });
  });

  app.get('/api/download', async (req, res) => {
    const appId = typeof req.query.appId === 'string' ? req.query.appId : '';
    const versionId = typeof req.query.versionId === 'string' ? req.query.versionId : undefined;
    const mirrorDomain = typeof req.query.mirror === 'string' ? req.query.mirror : undefined;

    const spec = resolveDownloadSpec(MOD_APPS, appId, versionId, mirrorDomain);
    if (!spec) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    await proxyApkStream(req, res, spec.upstreamUrl, spec.filename, spec.sourceDomain, () =>
      buildApkPackageBytes(spec.app, spec.version)
    );
  });

  app.get('/api/fdroid/lookup', async (req, res) => {
    const pkg = typeof req.query.pkg === 'string' ? req.query.pkg.trim() : '';
    if (!PACKAGE_ID_REGEX.test(pkg)) {
      res.status(400).json({ error: 'معرف الحزمة غير صالح (مثال: org.videolan.vlc)' });
      return;
    }

    try {
      const apiRes = await fetch(`https://f-droid.org/api/v1/packages/${encodeURIComponent(pkg)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!apiRes.ok) {
        res.status(404).json({ error: 'لم يتم العثور على هذه الحزمة في مستودع F-Droid الرسمي.' });
        return;
      }

      const data = (await apiRes.json()) as {
        packageName: string;
        suggestedVersionCode?: number;
        packages?: { versionName: string; versionCode: number }[];
      };

      res.json({
        packageName: data.packageName,
        suggestedVersionCode: data.suggestedVersionCode ?? data.packages?.[0]?.versionCode ?? 0,
        packages: (data.packages ?? []).slice(0, 5),
      });
    } catch {
      res.status(502).json({ error: 'تعذر الاتصال بخادم F-Droid في الوقت الحالي.' });
    }
  });

  app.get('/api/fdroid/download', async (req, res) => {
    const pkg = typeof req.query.pkg === 'string' ? req.query.pkg.trim() : '';
    const versionCodeRaw = typeof req.query.versionCode === 'string' ? req.query.versionCode.trim() : '';
    const versionCode = Number(versionCodeRaw);

    if (!PACKAGE_ID_REGEX.test(pkg) || !Number.isInteger(versionCode) || versionCode <= 0) {
      res.status(400).json({ error: 'Invalid F-Droid package parameters' });
      return;
    }

    const upstreamUrl =
      pkg === 'org.fdroid.fdroid'
        ? 'https://f-droid.org/F-Droid.apk'
        : `https://f-droid.org/repo/${pkg}_${versionCode}.apk`;
    const filename = `${pkg}-v${versionCode}-fdroid.apk`;

    await proxyApkStream(req, res, upstreamUrl, filename, 'f-droid.org');
  });

  app.get('/api/android-project.zip', (req, res) => {
    const rawUrl = typeof req.query.appUrl === 'string' ? req.query.appUrl : '';
    const cleanUrl = sanitizeWrapperUrl(rawUrl);

    const iconPath = path.resolve(__dirname, 'public/pwa-512x512.png');
    const bannerPath = path.resolve(__dirname, 'public/tv-banner.png');
    const launcherIconPng = fs.existsSync(iconPath)
      ? new Uint8Array(fs.readFileSync(iconPath))
      : undefined;
    const tvBannerPng = fs.existsSync(bannerPath)
      ? new Uint8Array(fs.readFileSync(bannerPath))
      : undefined;

    const zipBytes = Buffer.from(
      buildAndroidProjectZip(cleanUrl, { launcherIconPng, tvBannerPng })
    );
    const filename = 'AXIOS-TV-Phone-TV-AndroidProject.zip';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(zipBytes.length));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(zipBytes);
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AXIOS TV server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AXIOS TV server:', err);
  process.exit(1);
});
