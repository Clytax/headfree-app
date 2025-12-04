# Headfree

Headfree helps you track migraines and forecasts your next attack before it strikes.

Headfree is a migraine companion app for adults who struggle with recurring attacks and want more control in their daily life. By logging habits like sleep, caffeine, meals and stress, Headfree uses a custom machine learning model to forecast your migraine risk for the next day and surface actionable warnings. When an attack is about to hit, Emergency Mode helps you quickly put your phone and your environment into a migraine friendly state, so you can focus on getting through the episode, not fiddling with settings.

> Headfree is not a medical device and does not replace professional medical advice.

---

## Screenshots

### Daily Forecast

![Daily forecast](docs/app-forecast-preview.png)

### Emergency Mode

![Emergency mode](docs/app-emergency-preview.png)

### Daily Diary

![Daily diary entry](docs/app-diary-preview.png)

---

## Demo

https://github.com/<your-username>/<your-repo>/assets/<generated-id>/app-forecast-preview-video.mp4

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Builds and Releases](#builds-and-releases)
- [Testing and Quality](#testing-and-quality)
- [Project Structure](#project-structure)
- [CI and CD](#ci-and-cd)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Daily migraine forecasts**
  Enter information about your day such as meals, caffeine intake, sleep, stress and movement. Headfree uses a custom machine learning model to forecast your migraine risk for the next day and surfaces this as a clear, simple prediction.

- **Actionable warnings**
  See which factors contributed most to your current forecast so you can adjust habits rather than guess. The app highlights the most influential inputs as simple, understandable explanations.

- **Emergency Mode**
  When you feel a migraine coming, activate Emergency Mode to automatically adjust your phone to your preferred migraine safe setup:

  - Lower brightness
  - Reduced animations
  - Optional focus or do not disturb configuration
  - Calmer screen layout

- **Guided relief tools**
  During an active attack, Emergency Mode can guide you through:

  - Breathing exercises
  - Ice or cold therapy suggestions
  - Simple, low effort tips collected in one place

- **Secure and privacy aware**

  - Authentication with Firebase Auth
  - Data stored in Firestore on EU servers to align with GDPR
  - No third party tracking or analytics at this point

### Planned

- **Trends and insights**
  Let the app show you which factors had the strongest effects on your migraines over time. Learn which habits actually matter for you, visually and in plain language.

---

## Tech Stack

- **Platform**: React Native with Expo (SDK 53+, prebuild and development builds)
- **Language**: TypeScript
- **Routing and navigation**: `expo-router`
- **State management**:

  - Global state: Zustand and React Context where appropriate

- **Forms**: `react-hook-form`
- **Networking and data fetching**:

  - `axios`
  - `@tanstack/react-query` for data fetching, caching and mutations

- **Styling**: React Native `StyleSheet` based styling
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore (EU region)
- **Analytics**: None at the moment, no third party tracking
- **Machine Learning**: Custom migraine forecasting model accessed via API
- **Tooling**: Expo CLI, EAS Build, development builds and prebuild workflow

---

## Architecture

Headfree follows a modular architecture built around Expo Router and a clear separation between presentation, state and services:

- **Routing with Expo Router**

  - `app/` directory defines the navigation structure (stack, tabs and nested routes).
  - Screens map closely to logical user flows such as dashboard, diary, forecast details and emergency mode.

- **State and data**

  - **Client state** (UI state, ephemeral options) handled by Zustand and React Context.
  - **Server state** (Firestore data and API derived data) handled via React Query with dedicated query and mutation keys.
  - Domain like diary entries, forecasts and user settings are represented as typed schemas.

- **Services and APIs**

  - `services/` contains:

    - API clients that call the Headfree backend via `EXPO_PUBLIC_HEADFREE_API`
    - Integrations with Firebase Auth and Firestore
    - Side effect heavy logic such as writing logs or syncing with remote services

- **UI components**

  - `components/common` provides reusable UI elements such as buttons, cards, typography, layout containers and input fields.
  - Screens composed from these primitives plus feature specific components.

- **Schemas and types**

  - `schemas/` defines validation schemas for forms and API payloads.
  - `types/` centralises TypeScript types for core entities such as `DiaryEntry`, `Forecast`, and `EmergencySettings`.

The goal is to keep business logic out of screen components and route files, so most logic lives in hooks and services that can be tested and reused.

---

## Requirements

- **Node.js**: 22.21.0 (used for development)
- **Package manager**: npm
- **Expo SDK**: 53+
- **React Native**: 0.79.6
- **Android**:

  - Minimum version: Android 7.0 (API level 24) or higher
  - Android Studio with current SDK tools

- **iOS**:

  - Minimum iOS version: 15.1 or higher
  - Xcode 16 or newer

- **Tooling**:

  - Git
  - Watchman recommended on macOS

---

## Environment Setup

Headfree uses a single public environment variable for API communication.

Create a `.env` file in the project root based on the example below:

```env
EXPO_PUBLIC_HEADFREE_API=https://your-headfree-api.example.com
```

Notes:

- `EXPO_PUBLIC_HEADFREE_API` is required and should point to the backend that exposes the forecasting API and other Headfree endpoints.
- Do not commit `.env` files. Commit a `.env.example` file instead to document required keys.

Expo will automatically expose variables prefixed with `EXPO_PUBLIC_` to the client.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/headfree.git
cd headfree

# Install dependencies
npm install
```

If you have not set up Expo globally, the project uses `npx` so no global install is strictly required.

---

## Running the App

Headfree uses Expo prebuild and development builds instead of Expo Go for a setup that is closer to production.

### 1. Prebuild native projects

If you have not prebuilt yet or after native dependency changes:

```bash
npx expo prebuild
```

This generates the `ios/` and `android/` directories based on your Expo config.

### 2. Run in iOS Simulator or Android Emulator

You can either use development builds (recommended) or run directly.

**Development build and dev client**

```bash
# Start the dev server
npx expo start

# Build and run iOS development client
npx expo run:ios

# Build and run Android development client
npx expo run:android
```

Once the development client is installed, you can usually just run:

```bash
npx expo start
```

and open the app from the client.

---

## Builds and Releases

Headfree uses EAS Build with standard build profiles.

### Building

Production release builds are handled through EAS:

```bash
# Production builds
eas build --profile production --platform ios
eas build --profile production --platform android

# Development builds
eas build --profile development --platform ios
eas build --profile development --platform android
```

The EAS profiles use automatic build number bumping for new submissions.

### Submitting to stores

Submission is done with EAS Submit:

```bash
# Submit iOS build to App Store Connect
eas submit --platform ios

# Submit Android build to Google Play Console
eas submit --platform android
```

Store specific information such as icons, splash screens, bundle identifiers and versioning is configured through the Expo app config and native projects generated by prebuild.

---

## Testing and Quality

### Unit tests

Headfree uses Jest for unit testing.

Typical test commands:

```bash
# Run tests
npm test
```

Tests cover:

- Pure logic such as helper functions and hooks
- Simple rendering and behaviour tests for core components

### Linting and formatting

The project uses ESLint and Prettier.

Example commands:

```bash
# Lint
npm run lint

# Format
npm run format
```

### Type checking

TypeScript is used throughout the codebase. A common script is:

```bash
npm run typecheck
```

Update these commands to match the actual scripts in `package.json`.

---

## Project Structure

High level layout:

```text
src/
  app/           Expo Router routes and screens
  assets/        Images, fonts and static assets
  components/
    common/      Reusable UI components
  context/       React Context providers
  hooks/         Shared React hooks
  providers/     Top level providers (query client, theme, auth, etc.)
  services/      API clients, Firebase integration, ML forecast service
  schemas/       Validation and data schemas
  store/         Zustand stores and state slices
  types/         Shared TypeScript types
  utils/         Utility functions and helpers
App.tsx          App entry (if used) or Expo Router bootstrap
```

The `app/` directory is the primary entry point for routes managed by Expo Router. Context, providers and stores are designed to be reused across screens with minimal coupling.

---

## CI and CD

Continuous integration and delivery is not yet configured.

Recommended next steps:

- Add a GitHub Actions workflow that on each pull request:

  - Installs dependencies with cached `node_modules`
  - Runs tests (`npm test`)
  - Runs linting and type checking

- Later, add an EAS Build integration that:

  - Builds preview versions on pull requests
  - Builds release candidates on main branch merges

This section is a placeholder until CI and CD are in place.

---

## Contributing

Headfree is currently a private project but is planned to be opened up in the future. Until then, the contribution process follows common industry practices:

1. **Branching model**

   - Use feature branches derived from `main` or `develop`, for example:

     - `feature/emergency-mode-improvements`
     - `fix/forecast-card-layout`

2. **Commit messages**

   - Prefer clear, descriptive messages. Conventional Commits style is encouraged:

     - `feat: add breathing exercise step to emergency flow`
     - `fix: correct timezone handling in diary list`

3. **Pull requests**

   - Keep pull requests focused on a single topic.
   - Ensure tests and linting pass before requesting review.
   - Describe the change, motivation and any user facing impact.
   - Include screenshots or screen recordings for UI changes if relevant.

4. **Code style**

   - Follow ESLint and Prettier configurations defined in the project.
   - Reuse existing patterns for state management, services and routing.

When the repository becomes public, additional guidelines such as a code of conduct and detailed contribution docs can be added here.

---

## Troubleshooting

Some common issues and quick fixes:

- **Metro stuck or behaving strangely**

  ```bash
  # Stop Metro and clear cache
  npx expo start --clear
  ```

- **Build errors after dependency or SDK upgrades**

  ```bash
  # Regenerate native projects
  npx expo prebuild --clean

  # Reinstall dependencies
  rm -rf node_modules
  npm install
  ```

- **Android build issues in local environment**

  - Confirm Android Studio and SDK tools are up to date.
  - Check that Java JDK and environment variables are correctly set.

- **iOS build issues**

  - Confirm Xcode version matches the current Expo SDK requirements.
  - Clean derived data in Xcode if needed and rebuild.

If an issue persists, open an issue in the repository with logs and steps to reproduce or contact the maintainer directly.

---

## License

The license for Headfree has not been finalised yet.

Until a specific license file is added:

- All rights are reserved by the author.
- You may not redistribute or sell the app or its code without explicit permission.

A formal license will be chosen before the repository becomes public.

---

## Contact

For questions, feedback or collaboration inquiries:

- Email: `clytax@gmx.de`
- Issues: use the GitHub issue tracker once the repository is public
