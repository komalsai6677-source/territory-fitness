# Territory Fitness App

This workspace now contains a working mobile prototype for your project: a location-based fitness and territory capture app inspired by products like INTVL.

## What is set up

- Local portable `Node.js` in [`.tools/`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground\.tools)
- Expo React Native app in [`mobile/`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground\mobile)
- Shared app state and GPS session tracking in [`mobile/src/context/AppContext.tsx`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground\mobile\src\context\AppContext.tsx)
- Live map screen in [`mobile/src/screens/MapScreen.tsx`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground\mobile\src\screens\MapScreen.tsx)
- Local persistence for territory and session history in [`mobile/src/lib/storage.ts`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground\mobile\src\lib\storage.ts)

## How to run the app

Open PowerShell in [`C:\Users\ASUS\OneDrive\Pictures\Documents\Playground`](C:\Users\ASUS\OneDrive\Pictures\Documents\Playground) and run:

```powershell
$env:Path = (Resolve-Path '.tools\node-v22.14.0-win-x64').Path + ';' + $env:Path
Set-Location mobile
npm.cmd start
```

Then:

- Install `Expo Go` on your Android phone
- Scan the QR code from the terminal

If Expo prints a React Native DevTools `spawn EPERM` message in this environment, ignore it. Metro can still start.

## How to run the backend

Open a second PowerShell window and run:

```powershell
$env:Path = (Resolve-Path '.tools\node-v22.14.0-win-x64').Path + ';' + $env:Path
Set-Location server
npm.cmd start
```

The API will start on `http://localhost:8787`.

Production Render backend:

- `https://territory-fitness-api-2.onrender.com`
- When `DATABASE_URL` is set, the backend now stores app state in PostgreSQL instead of the local JSON file

Demo account for backend bootstrap:

- email: `you@example.com`
- password: `demo-pass`

## How to run tests

Mobile type-check:

```powershell
$env:Path = (Resolve-Path '.tools\node-v22.14.0-win-x64').Path + ';' + $env:Path
Set-Location mobile
.\node_modules\.bin\tsc.cmd --noEmit
```

Server tests:

```powershell
$env:Path = (Resolve-Path '.tools\node-v22.14.0-win-x64').Path + ';' + $env:Path
Set-Location server
npm.cmd test
```

## Current features

- Home dashboard with leaderboard, nearby runners, and recent sessions
- Start and stop live GPS sessions
- Distance, time, pace, and captured tile metrics
- Territory map with live route polyline and tile markers
- Nearby people and social discovery screen
- Profile summary and persistent local run history
- Local backend with bootstrap, session, territory, leaderboard, and nearby APIs
- Auth-ready backend with register, login, and follow endpoints
- Server-side movement validation to reject unrealistic speed and poor-accuracy updates

## Remaining work

- Server backend and database
- Real user accounts and authentication
- Real-time nearby user presence
- Server-authoritative movement validation and anti-spoof rules
- Group chat and social messaging
- Production deployment and store release
