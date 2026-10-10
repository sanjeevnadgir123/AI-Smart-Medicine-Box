# 💊 AI Smart Medicine Box

An intelligent IoT-enabled healthcare companion and smart medication dispenser mobile app built with **Expo (React Native)** and **Supabase**. The AI Smart Medicine Box helps patients and caregivers manage medication schedules, track dosage adherence, and link digital reminders with physical medicine compartments.

---

## 🌟 Key Features

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
  - Logging dosage adherence history and alerts.
- 🛡️ **Robust Security**
  - Full PostgreSQL Row Level Security (RLS) policies guaranteeing user data privacy.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) & [React Native](https://reactnative.dev/) (0.81)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **Icons & UI**: `@expo/vector-icons`, `expo-symbols`, `react-native-reanimated`

---

## 📂 Project Architecture

```text
├── app/                      # Expo Router screens
│   ├── (main)/               # Authenticated application flow
│   │   ├── _layout.tsx       # Bottom tab / stack navigation
│   │   ├── dashboard.tsx     # Home overview & upcoming doses
│   │   ├── medicines.tsx     # Medication list & compartment management
│   │   ├── add-medicine.tsx  # Add new prescription screen
│   │   ├── edit-medicine.tsx # Modify prescription screen
│   │   ├── schedule.tsx      # Daily timeline & schedule
│   │   ├── alerts.tsx        # Notification history
│   │   ├── history.tsx       # Adherence logs
│   │   ├── caregiver.tsx     # Remote monitoring & caregiver link
│   │   └── settings.tsx      # User settings & preferences
│   ├── auth/                 # Auth deep link callback handling
│   ├── login.tsx             # Login screen
│   ├── register.tsx          # Account registration screen
│   └── _layout.tsx           # Root navigation stack
├── components/               # Reusable UI cards, inputs, and buttons
├── constants/                # App theme colors and typography
├── lib/                      # Supabase client initialization
├── models/                   # TypeScript interfaces and data models
├── services/                 # API service layer
├── supabase/                 # Database migrations and schema SQL files
│   ├── schema.sql            # Base profiles schema
│   ├── medicine_schema.sql   # Medicines table and RLS policies
│   └── dose_schema.sql       # Dose log tracking schema
└── assets/                   # App icons, splash screens, and images
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

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
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

## 🔮 Hardware & IoT Integration (ESP32 Roadmap)

The AI Smart Medicine Box is engineered to communicate with a physical smart dispenser:
- **Microcontroller**: ESP32 / Raspberry Pi Pico W
- **Communication**: MQTT / WebSockets / Bluetooth Low Energy (BLE)
- **Features in progress**:
  - Auto-dispensing triggered by scheduled alarms
  - Compartment LED indicators & tamper sensors
  - Pill recognition via AI camera feed

---

## 📄 License

This project is licensed under the MIT License.
