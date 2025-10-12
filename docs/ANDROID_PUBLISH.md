# Publishing `zelo-news` as an Android App (TWA / Capacitor)

This document collects the concrete steps, templates and commands you can use to publish the `zelo-news` progressive web app to an Android store. It assumes you've already built the web app into `dist/` (run `npm ci && npm run build`).

TL;DR — recommended route for Play Store:
- Host `dist/` on HTTPS (e.g. Vercel or Netlify)
- Use Bubblewrap to generate a Trusted Web Activity (TWA) Android project
- Host a `/.well-known/assetlinks.json` with your app package and SHA-256 fingerprint
- Build an AAB and upload to Google Play Console

Prerequisites
- Node.js + npm
- Java JDK 11+
- Android SDK & Android Studio (for building / signing the AAB)
- A public HTTPS origin for your site (e.g. https://example.com)

1) Build the web app

```bash
cd /path/to/zelo-news
npm ci
npm run build

# verify dist/
ls -la dist
```

2) Deploy `dist/` to HTTPS hosting

- Deploy the `dist/` folder to Netlify, Vercel, or another HTTPS host.
- Ensure the manifest is reachable at `https://YOUR_ORIGIN/manifest.webmanifest` and the site works over HTTPS.

Quick Netlify deploy (optional):

```bash
# install netlify CLI (optional)
npm i -g netlify-cli
netlify deploy --dir=dist --prod
```

3) Asset Links (required for TWA)

- You must host a `/.well-known/assetlinks.json` file at the root of your origin.
- The file ties your Android app package name and signing key to the web origin.
- Use the `docs/assetlinks-template.json` file in this repo as a starting point.

Template (replace placeholders):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.yourapp",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

How to get the SHA-256 fingerprint for a keystore you generated locally:

```bash
# generate a keystore (if you don't have one)
keytool -genkeypair -v -keystore my-release-key.jks -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# print SHA-256 fingerprint
keytool -list -v -keystore my-release-key.jks -alias my-key-alias | grep 'SHA256' -A 1
```

4) Create a TWA with Bubblewrap (recommended)

Install Bubblewrap (or use npx):

```bash
npm i -g @bubblewrap/cli
# or use: npx @bubblewrap/cli
```

Initialize a TWA project (example):

```bash
# Replace placeholders: YOUR_ORIGIN, com.example.yourapp, "zelo.news"
bubblewrap init --manifest https://YOUR_ORIGIN/manifest.webmanifest \
  --applicationId com.example.yourapp \
  --host https://YOUR_ORIGIN \
  --name "zelo.news" \
  --shortName "zelo" \
  --output ./android-twa

# Then build the Android bundle (inside the generated project)
cd android-twa
./gradlew bundleRelease

# The produced AAB will be in app/build/outputs/bundle/release/
```

Notes about the Bubblewrap flow
- Bubblewrap's `init` step will ask for a few choices (splash screen color, icons). You can pass many options as flags for automation, but it's safe to run interactively. If you prefer non-interactive generation, provide flags for `--applicationId`, `--host`, `--name`, `--launcherName`.
- After build, host `/.well-known/assetlinks.json` and include your app's package name and SHA-256 fingerprint.

5) Alternative: Capacitor (WebView wrapper)

If you need native plugins, Capacitor is a reasonable alternative. It's a WebView-based wrapper and not a TWA.

```bash
npm install @capacitor/cli @capacitor/core
npx cap init
# set the webDir to "dist" when prompted
npx cap add android
npx cap copy
npx cap open android
# Build and sign the AAB in Android Studio
```

6) Sign and upload

- Use Google Play Console to upload the AAB, fill listing details, screenshots, privacy policy, and distribution.
- You can enable Google Play App Signing (recommended) or sign with your own keystore.

Checklist before upload
- [ ] Hosted origin is HTTPS and stable
- [ ] `manifest.webmanifest` reachable and correct
- [ ] Service worker registered (Lighthouse PWA checks pass)
- [ ] `/.well-known/assetlinks.json` hosted and correct
- [ ] AAB produced and signed

Troubleshooting
- If TWA verification fails, confirm package name and SHA-256 fingerprint in `assetlinks.json` exactly match the signed app.
- Use `adb logcat` to view runtime errors when testing the app on a device.

If you want, I can:
- generate the `assetlinks.json` template (done in this repo)
- run Bubblewrap init against `dist/manifest.webmanifest` to create an `android-twa` project (requires JDK/Android SDK to build the AAB)
- or prepare a Capacitor wrapper inside the repo

---
Generated on 2025-10-12

Quick helper: generate an `assetlinks.json` file

If you have your Android package name and the SHA-256 fingerprint of your signing key you can generate a file locally:

```bash
# from the repo root
node scripts/generate-assetlinks.js com.example.yourapp "AA:BB:CC:...:ZZ"

# result written to docs/assetlinks-generated.json
```

Host the generated file at: `https://YOUR_ORIGIN/.well-known/assetlinks.json`

