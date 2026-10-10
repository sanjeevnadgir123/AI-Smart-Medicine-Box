# Project Structure

This document outlines the organization and purpose of each directory and file in the **AI Smart Medicine Box v2** codebase.

```text
AI-Smart-Medicine-Box-v2/
├── app/                         # Expo Router screens and route groups
│   ├── _layout.tsx              # Root stack layout and deep-link handler
│   ├── index.tsx                # Initial entry route (auth check & splash redirect)
│   ├── login.tsx                # User authentication login screen
│   ├── register.tsx             # New user account registration screen
│   ├── auth/
│   │   └── callback.tsx         # OAuth & email verification callback route
│   └── (main)/                  # Authenticated app route group
│       ├── _layout.tsx          # Main stack layout with notification response listener
│       ├── dashboard.tsx        # Home dashboard with upcoming doses and status
│       ├── medicines.tsx        # Prescriptions list and compartment management
│       ├── add-medicine.tsx     # Screen to add new medication schedule
│       ├── edit-medicine.tsx    # Screen to modify existing medication schedule
│       ├── schedule.tsx         # Daily dose timeline and intake check-in
│       ├── settings.tsx         # User profile, notifications, and logout settings
│       ├── alerts.tsx           # Notification and alarm alert history screen
│       ├── history.tsx          # Medication adherence history logs
│       └── caregiver.tsx        # Caregiver remote monitoring screen
│
├── src/                         # Core application source code
│   ├── components/              # Modular UI components
│   │   ├── common/              # Shared base UI widgets
│   │   │   ├── AppButton.tsx    # Custom styled button with loading/variant states
│   │   │   └── AppTextInput.tsx # Custom styled input with password toggle & validation
│   │   ├── dashboard/           # Dashboard-specific widgets
│   │   │   ├── DeviceStatusCard.tsx  # Physical device connectivity card
│   │   │   └── QuickActionCard.tsx   # Fast action launcher button card
│   │   └── medicines/           # Medication-specific widgets
│   │       └── MedicineCard.tsx # Medicine summary card with status indicators
│   ├── services/                # Business logic and external API services
│   │   ├── index.ts             # Service barrel exports
│   │   ├── medicineService.ts   # Prescription CRUD operations with Supabase
│   │   ├── doseService.ts       # Dose generation, adherence tracking, and updates
│   │   └── notificationService.ts # Local push notification scheduling via Expo Notifications
│   ├── models/                  # Domain data types and TypeScript interfaces
│   │   ├── medicine.ts          # Medicine data model and repeat frequency types
│   │   └── dose.ts              # Dose log data model and status enums
│   ├── constants/               # Global styling and configuration constants
│   │   └── theme.ts             # Color palette, spacing, typography, and border radius
│   └── hooks/                   # Custom React hooks
│       ├── use-color-scheme.ts  # Theme color scheme detection
│       ├── use-color-scheme.web.ts # Web platform fallback
│       └── use-theme-color.ts   # Dynamic theme color resolver
│
├── lib/                         # External client initializations
│   └── supabase.ts              # Supabase client initialized with AsyncStorage
│
├── assets/                      # Static assets
│   └── images/                  # App icon, splash screen, and branding artwork
│
├── supabase/                    # Database migrations and SQL schemas
│   ├── schema.sql               # Profiles table and user security setup
│   ├── medicine_schema.sql      # Medicines table schema and RLS policies
│   └── dose_schema.sql          # Dose logs schema and RLS policies
│
├── docs/                        # Project technical documentation
│   ├── architecture.md          # System architecture and layer boundaries
│   ├── project-structure.md     # Directory organization (this file)
│   └── setup.md                 # Development setup and build guide
│
├── scripts/                     # Utility scripts
│   └── reset-project.js         # Template starter reset script (Expo default)
│
├── .env.example                 # Example environment variables (placeholders only)
├── .gitignore                   # Git ignore rules (node_modules, .env, builds)
├── app.json                     # Expo application configuration and plugins
├── eas.json                     # EAS Build profiles (development, preview, production)
├── eslint.config.js             # ESLint configuration
├── package.json                 # Project dependencies and npm scripts
├── package-lock.json            # Deterministic dependency lockfile
├── project_info.json            # Architectural milestone tracking metadata
├── tsconfig.json                # TypeScript compiler configuration with path aliases
└── README.md                    # Project README and introduction
```
