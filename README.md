# Moonmoss for iOS

This folder turns `game/moonmoss.html` (the same file you put on itch.io) into an iPhone app, and builds it on GitHub's Macs, so no Mac is needed.

## What's in here

| Path | What it is |
| --- | --- |
| `game/moonmoss.html` | The game, readable. Replace this file whenever the game changes. |
| `itch/` | Builds the itch.io file: `itch/moonmoss.html` is the game with the site lock (only runs on itch.io and locally) and obfuscated code. Uploaded automatically by the itch workflow; for a manual upload use this file, never `game/moonmoss.html`. |
| `.github/workflows/itch.yml` | Builds the locked + obfuscated game and uploads it to https://billjones.itch.io/moonmoss on every push that changes the game. |
| `scripts/prepare-web.mjs` | Copies the game into `www/` for the app: bundles the fonts so it works offline, adds the phone viewport, turns off text selection. |
| `ios/` | The Xcode project (Capacitor). Already set to: bundle ID `com.nathan.moonmoss`, iPhone only, landscape only, status bar hidden, export-compliance answered "no encryption". Icon and launch screen are in `ios/App/App/Assets.xcassets`. |
| `.github/workflows/ios-testflight.yml` | Builds the app on a GitHub Mac and uploads it to App Store Connect / TestFlight. |
| `store/` | App icon (1024×1024) and two screenshots at the 6.9" iPhone size App Store Connect asks for (2868×1320). |

## One-time setup

1. **Put this folder on GitHub** as a private repository named `moonmoss-ios` (account `nathann07`).
2. **Create an App Store Connect API key**: App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → **+**. Name it `GitHub builds`, access **Admin** (Admin is needed so the build can create its own signing certificate). Download the `.p8` file — Apple only lets you download it once. Note the **Key ID** (next to the key) and the **Issuer ID** (above the table).
3. **Find your Team ID**: developer.apple.com/account → Membership details → Team ID (10 characters).
4. **Add four secrets** to the repo: GitHub → `moonmoss-ios` → Settings → Secrets and variables → Actions → New repository secret:

   | Name | Value |
   | --- | --- |
   | `ASC_KEY_ID` | Key ID from step 2 |
   | `ASC_ISSUER_ID` | Issuer ID from step 2 |
   | `ASC_KEY_P8` | The whole contents of the `.p8` file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines (open it in Notepad and copy everything) |
   | `APPLE_TEAM_ID` | Team ID from step 3 |

5. **Run the build**: repo → Actions → *Build iOS and upload to TestFlight* → **Run workflow**. It takes about 10–15 minutes. When it finishes green, the build shows up in App Store Connect → TestFlight after Apple processes it (5–30 minutes).

## Testing on your iPhone

Install the **TestFlight** app from the App Store. In App Store Connect → TestFlight → Internal Testing, create a group, add yourself, and add the build. Open the invite on your phone and install Moonmoss.

## Publishing to itch.io

Automatic, like the iOS build. Needs one repository secret:
- `BUTLER_API_KEY` — an itch.io API key (itch.io → Settings → API keys), added under Settings → Secrets and variables → Actions.

On every push to `main` that changes the game, the workflow rebuilds the locked + obfuscated file and runs `butler push … billjones/moonmoss:html5`. To publish by hand, open the **Actions** tab, pick **Publish to itch.io**, and press **Run workflow**.

One-time cleanup: butler uploads its own `index.html` entry, so after the first run, delete the old manually-uploaded `moonmoss.html` on the itch edit page and mark butler's `index.html` as played in the browser.

## Updating the game later

1. Replace `game/moonmoss.html` with the new version. Commit and push — the itch workflow rebuilds and uploads it on its own (no manual upload needed once `BUTLER_API_KEY` is set).
2. If this is a new App Store release (not just another test build), bump `MARKETING_VERSION` in `ios/App/App.xcodeproj/project.pbxproj` (e.g. `1.0` → `1.1`; it appears twice).
3. Commit and push. The workflow runs on its own and uploads a new build with the next build number.
4. In App Store Connect, create the new version, pick the build, and submit for review.
