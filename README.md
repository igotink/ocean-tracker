# Ocean Tracker

Mobile-first PWA for tracking daily ocean conditions and personal cold-water logs for Muizenberg / St James, Cape Town.

## Features

- Installable PWA with manifest, service worker, app icon, and offline app shell
- Today dashboard and monthly calendar
- Open-Meteo weather and marine data
- WorldTides tide support for high tide, low tide, sampled tide height, next high, next low, and tide status
- Sunrise/sunset and moon data with free fallbacks
- Local personal logs stored in `localStorage`
- Share panel with install instructions for swimmers

## Local Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Start locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Keys

Open-Meteo does not need a key.

### WorldTides

WorldTides is required for reliable live tide predictions in Muizenberg.

1. Go to <https://www.worldtides.info/register>.
2. Create an account. New accounts start with free credits.
3. Copy your API key from your WorldTides account page.
4. Add it to `.env`:

```bash
VITE_WORLDTIDES_API_KEY=your_worldtides_key_here
```

Restart the app after changing `.env`.

If this key is missing, Ocean Tracker shows exact setup instructions in the app instead of silently failing.

### Optional Astronomy Key

For live moonrise/moonset from IPGeolocation:

```bash
VITE_IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here
```

Without this key, the app still uses sunrise-sunset.org, FarmSense moon phase data, and local moonrise/moonset estimates.

## Deploy To Vercel

1. Push this project to GitHub.
2. In Vercel, choose `Add New Project`.
3. Import the GitHub repository.
4. Use these settings:
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variables in Vercel Project Settings:

```bash
VITE_WORLDTIDES_API_KEY=your_worldtides_key_here
VITE_IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here
```

6. Deploy.

## Share The App

After deployment, copy the Vercel app URL and send it to swimmers. The in-app `Share Ocean Tracker` section can copy the current app link.

## Install On A Phone

iPhone:

1. Open the app link in Safari.
2. Tap Share.
3. Tap Add to Home Screen.

Android:

1. Open the app link in Chrome.
2. Tap Install App, or open the browser menu and choose Install App.

## Data Sources

- Weather: Open-Meteo Forecast API
- Marine: Open-Meteo Marine Weather API
- Tides: WorldTides API
- Astronomy: IPGeolocation optional, sunrise-sunset.org, FarmSense, local fallback estimates

Dates outside an API provider's live forecast window display `data unavailable` without breaking the app.
