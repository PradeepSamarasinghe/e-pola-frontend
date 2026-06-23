# E-Pola Frontend

E-Pola is a localized grocery delivery platform designed for the Sri Lankan market. This repository contains the frontend mobile application built with Expo and React Native.

## Features

- **Multi-language Support:** Localized for the Sri Lankan market with English, Sinhala, and Tamil support (powered by `i18next` and `expo-localization`).
- **Payment Integration:** Prepared for PayHere integration for seamless, localized customer payments.
- **Delivery Logistics:** Built-in interfaces for in-house delivery logistics, tracking hubs, and rider coordination.
- **Order Tracking:** Integrated with Expo Push Notifications to alert customers of order progress and provide responsive order tracking.
- **Modern UI/UX:** Built with React Native and Expo Router for smooth native transitions and performance.

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React Native](https://lucide.dev/) & Expo Vector Icons
- **Internationalization:** `react-i18next` & `i18next`
- **Error Tracking:** Sentry for React Native

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- npm or yarn
- [Expo Go](https://expo.dev/client) app installed on your iOS/Android device, or an iOS Simulator / Android Emulator running on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd e-pola-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on your specific backend configuration.
   ```bash
   # Example .env configuration
   EXPO_PUBLIC_API_URL=http://your-backend-api-url
   ```

### Running the Application

Start the Expo development server:

```bash
npm run dev
```

Once the Metro bundler starts, you can:
- **Physical Device:** Scan the QR code shown in the terminal with the Expo Go app (Android) or the Camera app (iOS).
- **Android Emulator:** Press `a` in the terminal to open the app in an active Android Emulator.
- **iOS Simulator:** Press `i` in the terminal to open the app in an active iOS Simulator.
- **Web:** Press `w` to open the app in your web browser.

## Project Structure

```
├── app/              # Expo Router pages, tabs, and screen layouts
├── assets/           # Images, custom fonts, and other static assets
├── components/       # Reusable UI components
├── constants/        # App-wide constants (themes, colors, typography)
├── context/          # React Context providers (Authentication, Cart, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions, API clients, and third-party setups
└── package.json      # Project metadata, scripts, and dependencies
```

## Available Scripts

- `npm run dev`: Starts the Expo development server.
- `npm run build:web`: Builds the app for the web platform.
- `npm run lint`: Runs ESLint to check for code quality and consistency.
- `npm run typecheck`: Runs TypeScript type checking.

## License

This project is open-source and available under the standard MIT License.
