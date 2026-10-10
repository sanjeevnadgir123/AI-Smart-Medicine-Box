# 💊 AI Smart Medicine Box v2

An intelligent IoT-enabled healthcare companion and smart medication dispenser mobile app built with **Expo (React Native)** and **Supabase**. The AI Smart Medicine Box helps patients and caregivers manage medication schedules, track dosage adherence, and link digital reminders with physical medicine compartments.

---

## 🌟 Implemented Features

- 🔐 **Authentication & User Profiles**
  - Secure email/password registration and login powered by Supabase Auth.
  - Deep linking OAuth support and persistent session state.
- 📦 **Compartment & Medication Management**
  - Add, edit, and organize medications mapped to physical box compartments (e.g., Compartments 1 to 4).
  - Define custom dosage amounts, dosage frequencies, and exact intake times.
- 📊 **Smart Interactive Dashboard**
  - Real-time overview of daily medication schedules and next upcoming doses.
  - Device and compartment connectivity indicators.
  - Quick actions to mark doses as taken, view schedules, and add prescriptions.
- ⏰ **Schedule & Adherence Tracking**
  - Timeline view of morning, afternoon, evening, and night doses.
  - Local push notifications scheduled via `expo-notifications`.
  - Logging dosage adherence history and alerts.
- 🛡️ **Robust Security**
  - Full PostgreSQL Row Level Security (RLS) policies guaranteeing tenant user data privacy.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/) (0.81)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **Notifications**: `expo-notifications`
- **State & Storage**: `@react-native-async-storage/async-storage`
- **UI & Animation**: `@expo/vector-icons`, `react-native-reanimated`
- **Build & Deployment**: EAS Build (Android preview / production)

---

## 📂 Project Structure

```text
AI-Smart-Medicine-Box-v2/
├── app/                         # Expo Router screens and routes
│   ├── _layout.tsx              # Root stack layout & auth deep-link handler
│   ├── index.tsx                # Entry route & auth check
│   ├── login.tsx                # User login screen
│   ├── register.tsx             # User registration screen
│   ├── auth/
│   │   └── callback.tsx         # OAuth callback handler
│   └── (main)/                  # Authenticated application flows
│       ├── _layout.tsx          # Main layout & notification response listener
│       ├── dashboard.tsx        # Home dashboard
│       ├── medicines.tsx        # Medicine management list
│       ├── add-medicine.tsx     # Add prescription screen
│       ├── edit-medicine.tsx    # Edit prescription screen
│       ├── schedule.tsx         # Daily schedule timeline
│       ├── settings.tsx         # App settings & notifications
│       ├── alerts.tsx           # Alerts screen
│       ├── history.tsx          # Adherence logs screen
│       └── caregiver.tsx        # Caregiver linkage screen
│
├── src/                         # Core application source
│   ├── components/              # Modular UI components
│   │   ├── common/              # AppButton, AppTextInput
│   │   ├── dashboard/           # DeviceStatusCard, QuickActionCard
│   │   └── medicines/           # MedicineCard
│   ├── services/                # medicineService, doseService, notificationService
│   ├── models/                  # medicine.ts, dose.ts interfaces
│   ├── constants/               # theme.ts (Colors, Spacing, Typography)
│   └── hooks/                   # use-color-scheme, use-theme-color
│
├── lib/                         # External clients (Supabase client)
├── assets/                      # App icons, splash screens, and artwork
├── supabase/                    # SQL migrations (schema, medicines, doses)
├── docs/                        # Architecture, project structure, setup guides
├── scripts/                     # Project reset scripts
├── .env.example                 # Environment variables template
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS/Android) or an emulator.

### 1. Clone the Repository

```bash
git clone https://github.com/sanjeevnadgir123/AI-Smart-Medicine-Box.git
cd AI-Smart-Medicine-Box
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

### 4. Database Setup (Supabase)

1. Create a project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Execute the SQL scripts in order:
   - `supabase/schema.sql`
   - `supabase/medicine_schema.sql`
   - `supabase/dose_schema.sql`

### 5. Run the Application

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code in the terminal using the **Expo Go** app (Android) or **Camera** app (iOS).

---

## 🧪 Testing & Verification

Run the TypeScript type checker:
```bash
npx tsc --noEmit
```

Run ESLint:
```bash
npm run lint
```

---

## 🔮 Hardware & IoT Integration (Planned Enhancement)

*Note: Physical hardware integration is a planned enhancement and is currently in active specification.*

The roadmap includes:
- **Microcontroller**: ESP32 / Raspberry Pi Pico W integration
- **Communication Protocol**: MQTT / WebSockets / Bluetooth Low Energy (BLE)
- **Planned Features**:
  - Hardware-triggered compartment unlocks and LEDs based on app schedule
  - Tamper/open physical sensors reporting adherence to Supabase
  - Vision AI for pill shape and color recognition via camera

---

## 📄 Documentation

Detailed technical documentation is available in the [`docs/`](./docs) directory:
- [Architecture Guide](docs/architecture.md)
- [Project Structure](docs/project-structure.md)
- [Setup & Build Guide](docs/setup.md)

---

## 📄 License

This project is licensed under the MIT License.
