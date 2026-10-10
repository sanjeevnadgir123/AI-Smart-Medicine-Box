# Architecture Documentation

## Overview

The **AI Smart Medicine Box v2** application is built using **Expo SDK 54** and **React Native**, backed by **Supabase** (PostgreSQL + Supabase Auth) and **Expo Notifications**.

The architecture adheres to clean separation of concerns, decoupling route screens from reusable presentation components, business logic services, data models, and external infrastructure clients.

---

## Architecture Diagram

```text
               Expo Router Screens (app/)
                          │
                          ▼
            Reusable UI Components (src/components/)
                          │
                          ▼
             Application Services (src/services/)
              ├── medicineService
              ├── doseService
              └── notificationService
                     │                  │
                     ▼                  ▼
             Supabase Client     Expo Notifications
             (lib/supabase.ts)           │
                     │                   │
                     ▼                   ▼
         Supabase Cloud Backend    Mobile / Android Device
         ├── Supabase Auth         ├── Local Push Alarms
         └── PostgreSQL + RLS      └── System Channels
```

---

## Architectural Layers

### 1. Presentation Layer (`app/` & `src/components/`)
- **Expo Router Routes (`app/`)**:
  - File-based routing providing navigation stacks and tabs.
  - Acts as controllers coordinating screen state, invoking services, and rendering UI views.
  - Routes:
    - Root: `app/_layout.tsx`, `app/index.tsx` (entry redirect check)
    - Authentication: `app/login.tsx`, `app/register.tsx`, `app/auth/callback.tsx`
    - Main App Group: `app/(main)/_layout.tsx`, `app/(main)/dashboard.tsx`, `app/(main)/medicines.tsx`, `app/(main)/add-medicine.tsx`, `app/(main)/edit-medicine.tsx`, `app/(main)/schedule.tsx`, `app/(main)/settings.tsx`, `app/(main)/alerts.tsx`, `app/(main)/history.tsx`, `app/(main)/caregiver.tsx`
- **Reusable Components (`src/components/`)**:
  - Pure presentational and composite components with scoped styling.
  - Subdivided into domain domains:
    - `src/components/common/`: Shared inputs and buttons (`AppButton`, `AppTextInput`).
    - `src/components/medicines/`: Prescription and compartment presentation cards (`MedicineCard`).
    - `src/components/dashboard/`: Overview cards (`DeviceStatusCard`, `QuickActionCard`).

### 2. Domain & Application Logic Layer (`src/services/` & `src/models/`)
- **Domain Models (`src/models/`)**:
  - Strong TypeScript interfaces defining data structures:
    - `medicine.ts`: Prescription definition, compartment mapping, schedule time, and repeat rules.
    - `dose.ts`: Individual dose execution log status (`pending`, `taken`, `missed`, `skipped`).
- **Application Services (`src/services/`)**:
  - `medicineService.ts`: CRUD operations for medicine prescriptions and compartment bindings.
  - `doseService.ts`: Generating daily dose timelines, calculating adherence, and recording intake timestamps.
  - `notificationService.ts`: Local notification permission requests, scheduling localized device alarms for medication times, and notification cancellation.

### 3. Infrastructure & Backend Layer (`lib/` & `supabase/`)
- **Supabase Client (`lib/supabase.ts`)**:
  - Initialized with `createClient` using `AsyncStorage` for persistent session management.
- **Supabase PostgreSQL & Security (`supabase/`)**:
  - PostgreSQL database with Row Level Security (RLS) guaranteeing tenant isolation.
  - SQL migration scripts:
    - `schema.sql`: Base user profiles schema with foreign key binding to `auth.users`.
    - `medicine_schema.sql`: `medicines` table and RLS policies.
    - `dose_schema.sql`: `dose_logs` table and RLS policies.
- **Hardware Integration (Planned Roadmap)**:
  - Designed for future pairing with ESP32 microcontrollers via MQTT/WebSockets/BLE for automated compartment dispensing.
