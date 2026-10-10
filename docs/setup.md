# Development Setup & Build Guide

This document provides setup instructions for the **AI Smart Medicine Box v2** application.

---

## 1. Prerequisites

- **Node.js**: Version 18.x or later (LTS recommended)
- **Package Manager**: `npm` (v9+)
- **Expo CLI**: Bundled via `npx expo`
- **EAS CLI**: `npm install -g eas-cli` (required for cloud builds)
- **Git**: Installed and configured

---

## 2. Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanjeevnadgir123/AI-Smart-Medicine-Box.git
   cd AI-Smart-Medicine-Box
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 3. Environment Variables

Create a local `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Populate the file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

> **Security Note:** Never commit `.env` containing sensitive credentials to Git. It is automatically ignored by `.gitignore`.

---

## 4. Supabase Database Setup

Execute the SQL scripts in your Supabase SQL Editor in the following order:

1. `supabase/schema.sql` (Creates profiles table and trigger)
2. `supabase/medicine_schema.sql` (Creates medicines table and RLS policies)
3. `supabase/dose_schema.sql` (Creates dose_logs table and RLS policies)

---

## 5. Local Development Commands

Start the Expo development server:

```bash
npx expo start
```

Run on specific platforms:
- **Android**: `npm run android` (or press `a` in the Expo terminal)
- **iOS**: `npm run ios` (or press `i` in the Expo terminal)
- **Web**: `npm run web` (or press `w` in the Expo terminal)

---

## 6. Verification Commands

Run TypeScript compiler check:
```bash
npx tsc --noEmit
```

Run ESLint check:
```bash
npm run lint
```

---

## 7. EAS Preview Build (Android APK)

To generate an Android preview build (APK for testing on devices):

1. Log in to EAS:
   ```bash
   eas login
   ```

2. Run the preview build:
   ```bash
   eas build --profile preview --platform android
   ```

The build artifact will be available in your Expo dashboard upon completion.
