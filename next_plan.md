# MAESTA Internationalization (i18n) Implementation Plan

**Date:** 2026-05-17  
**Purpose:** Comprehensive plan to implement multi-language support for the MAESTA platform  
**Target Languages:** English (current), Arabic, French, and extensible for additional languages  
**Scope:** Frontend React application and Backend API

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Technical Approach](#technical-approach)
4. [Library Selection](#library-selection)
5. [Implementation Strategy](#implementation-strategy)
6. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
7. [File Structure](#file-structure)
8. [Translation Management](#translation-management)
9. [RTL Support](#rtl-support)
10. [Backend API Internationalization](#backend-api-internationalization)
11. [SEO & Metadata](#seo--metadata)
12. [Accessibility](#accessibility)
13. [Testing Strategy](#testing-strategy)
14. [Timeline & Resources](#timeline--resources)
15. [Maintenance & Updates](#maintenance--updates)

---

## Executive Summary

This plan outlines the implementation of comprehensive internationalization (i18n) for the MAESTA job marketplace platform. The project currently supports only English and needs to be extended to support Arabic (RTL), French, and provide a framework for adding additional languages in the future.

**Key Objectives:**
- Implement a scalable translation system
- Support both LTR (Left-to-Right) and RTL (Right-to-Left) languages
- Maintain code quality and performance
- Ensure consistent user experience across all languages
- Provide easy framework for adding new languages

**Estimated Timeline:** 6-8 weeks  
**Complexity:** High  
**Priority:** Medium-High

---

## Current State Analysis

### Frontend Technology Stack
- **Framework:** React 19.2.0
- **Build Tool:** Create React App with CRACO
- **Styling:** CSS Modules + TailwindCSS
- **Routing:** React Router DOM 6.8.0
- **State Management:** React Context API
- **Current Dependencies:** No i18n libraries installed

### Codebase Characteristics
- **Component Count:** 100+ React components
- **Pages:** 40+ pages across multiple dashboards
- **Text Content:** Hardcoded English strings throughout components
- **Date/Time:** Using date-fns library (i18n capable)
- **Number Formatting:** Standard JavaScript formatting

### Challenges Identified
1. **Hardcoded Strings:** All UI text is hardcoded in English
2. **No Translation Infrastructure:** No existing translation files or system
3. **RTL Support:** Current layout assumes LTR only
4. **Dynamic Content:** User-generated content needs language handling
5. **API Responses:** Backend returns English-only messages
6. **Form Validation:** Error messages are hardcoded

---

## Technical Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Components  │  │     Pages    │  │   Contexts   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Internationalization Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ react-i18next │  │  Translation │  │  RTL/LTR     │   │
│  │    Provider   │  │    Files     │  │   Handler    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Translation Management                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  JSON Files  │  │  Namespace   │  │  Key System  │   │
│  │  (per lang)  │  │  Organization│  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns:** Keep translations separate from component logic
2. **Namespace Organization:** Group translations by feature/page
3. **Fallback Strategy:** English as default fallback for missing translations
4. **Performance:** Lazy load language files to reduce initial bundle size
5. **Type Safety:** Use TypeScript for translation keys (if migrating to TS)
6. **RTL Awareness:** Automatic layout direction based on language

---

## Library Selection

### Primary Library: react-i18next

**Rationale:**
- Industry standard for React i18n
- Excellent documentation and community support
- Built-in support for namespaces, interpolation, pluralization
- Lazy loading capabilities
- TypeScript support
- Active maintenance (100k+ weekly downloads)

**Alternative Considered:**
- **FormatJS (react-intl):** More powerful but steeper learning curve
- **Lingui:** Better for TypeScript but less mature ecosystem

### Supporting Libraries

**Runtime Dependencies:**
```json
{
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0",
  "i18next-browser-languagedetector": "^7.2.0",
  "i18next-http-backend": "^2.4.0"
}
```

**Dev Dependencies:**
```json
{
  "i18next-parser": "^8.0.0"
}
```

**Tailwind RTL Plugin:**
```json
{
  "tailwindcss-rtl": "^0.9.0"
}
```

### Date/Time Library: Native Intl + date-fns

**Rationale:**
- Use native `Intl.NumberFormat` and `Intl.DateTimeFormat` for locale-aware formatting — no extra bundle cost
- `date-fns` (already installed) remains for date arithmetic and locale-specific formatting utilities
- Tree-shakeable for better performance

**Additional Required:**
```json
{
  "date-fns": "^4.1.0"
}
```

---

## Implementation Strategy

### Strategy Overview

**Approach:** Incremental implementation with feature flags

1. **Phase 1:** Setup infrastructure and core components
2. **Phase 2:** Migrate critical user-facing pages
3. **Phase 3:** Migrate remaining pages and components
4. **Phase 4:** Backend API internationalization
5. **Phase 5:** Testing, optimization, and documentation

### Migration Strategy

**Option A: Complete Rewrite (Recommended)**
- Pros: Clean implementation, consistent patterns
- Cons: Higher initial effort
- Timeline: 6-8 weeks

**Option B: Incremental Migration**
- Pros: Lower risk, gradual rollout
- Cons: Mixed code during transition, potential inconsistencies
- Timeline: 8-10 weeks

**Decision:** Option A with feature flags for gradual rollout

---

## Phase-by-Phase Implementation

### Phase 1: Infrastructure Setup (Week 1-2)

#### 1.1 Install Dependencies
```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
npm install date-fns --save
npm install --save-dev i18next-parser
npm install tailwindcss-rtl
```

#### 1.2 Create i18n Configuration
**File:** `Frontend/src/i18n/config.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      // i18next escapes interpolated values by default — never disable for user content.
      // Never use dangerouslySetInnerHTML with user-provided translation keys.
      escapeValue: true,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Use React.lazy + Suspense at route level for code splitting (see Performance section)
    react: {
      useSuspense: true,
    },

    // Report missing keys to Sentry / custom endpoint
    missingKeyHandler: (lngs, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing key: "${ns}:${key}" for lang [${lngs}]`);
      }
      // In production, forward to Sentry:
      // Sentry.captureMessage(`Missing i18n key: ${ns}:${key}`, 'warning');
      // Or custom endpoint:
      // fetch('/api/i18n/missing', { method: 'POST', body: JSON.stringify({ key, ns, lngs }) });
    },
  });

export default i18n;
```

#### 1.3 Create Translation File Structure
```
Frontend/src/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── jobs.json
│   ├── gigs.json
│   ├── profile.json
│   ├── errors.json
│   └── validation.json
├── ar/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── jobs.json
│   ├── gigs.json
│   ├── profile.json
│   ├── errors.json
│   └── validation.json
└── fr/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── jobs.json
    ├── gigs.json
    ├── profile.json
    ├── errors.json
    └── validation.json
```

#### 1.4 Create Language Switcher Component
**File:** `Frontend/src/components/common/LanguageSwitcher.jsx`

#### 1.5 Setup RTL/LTR Support
**File:** `Frontend/src/i18n/rtl.js`

```javascript
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const isRTL = (language) => RTL_LANGUAGES.includes(language);

export const setDocumentDirection = (language) => {
  const direction = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
};
```

#### 1.6 Update Root Component
**File:** `Frontend/src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Phase 2: Core Translations (Week 3-4)

#### 2.1 Create Common Translations
**File:** `Frontend/src/locales/en/common.json`

```json
{
  "appName": "MAESTA",
  "welcome": "Welcome",
  "login": "Login",
  "logout": "Logout",
  "register": "Register",
  "dashboard": "Dashboard",
  "profile": "Profile",
  "settings": "Settings",
  "search": "Search",
  "filter": "Filter",
  "save": "Save",
  "cancel": "Cancel",
  "submit": "Submit",
  "delete": "Delete",
  "edit": "Edit",
  "view": "View",
  "loading": "Loading...",
  "error": "Error",
  "success": "Success",
  "back": "Back",
  "next": "Next",
  "previous": "Previous",
  "close": "Close",
  "confirm": "Confirm",
  "yes": "Yes",
  "no": "No"
}
```

#### 2.2 Create Arabic Translations
**File:** `Frontend/src/locales/ar/common.json`

```json
{
  "appName": "مايستا",
  "welcome": "مرحباً",
  "login": "تسجيل الدخول",
  "logout": "تسجيل الخروج",
  "register": "التسجيل",
  "dashboard": "لوحة التحكم",
  "profile": "الملف الشخصي",
  "settings": "الإعدادات",
  "search": "بحث",
  "filter": "تصفية",
  "save": "حفظ",
  "cancel": "إلغاء",
  "submit": "إرسال",
  "delete": "حذف",
  "edit": "تعديل",
  "view": "عرض",
  "loading": "جاري التحميل...",
  "error": "خطأ",
  "success": "نجح",
  "back": "رجوع",
  "next": "التالي",
  "previous": "السابق",
  "close": "إغلاق",
  "confirm": "تأكيد",
  "yes": "نعم",
  "no": "لا"
}
```

#### 2.3 Create French Translations
**File:** `Frontend/src/locales/fr/common.json`

```json
{
  "appName": "MAESTA",
  "welcome": "Bienvenue",
  "login": "Connexion",
  "logout": "Déconnexion",
  "register": "S'inscrire",
  "dashboard": "Tableau de bord",
  "profile": "Profil",
  "settings": "Paramètres",
  "search": "Rechercher",
  "filter": "Filtrer",
  "save": "Enregistrer",
  "cancel": "Annuler",
  "submit": "Soumettre",
  "delete": "Supprimer",
  "edit": "Modifier",
  "view": "Voir",
  "loading": "Chargement...",
  "error": "Erreur",
  "success": "Succès",
  "back": "Retour",
  "next": "Suivant",
  "previous": "Précédent",
  "close": "Fermer",
  "confirm": "Confirmer",
  "yes": "Oui",
  "no": "Non"
}
```

#### 2.4 Migrate Authentication Pages
- Login page
- Registration pages (Step 1 & Step 2)
- Password reset pages
- Email verification pages

#### 2.5 Migrate Dashboard Navigation
- Sidebar menu items
- Header elements
- Navigation breadcrumbs

### Phase 3: Feature-Specific Translations (Week 5-6)

#### 3.1 Job-Related Translations
**File:** `Frontend/src/locales/en/jobs.json`

```json
{
  "jobs": "Jobs",
  "jobTitle": "Job Title",
  "company": "Company",
  "location": "Location",
  "salary": "Salary",
  "postedDate": "Posted Date",
  "apply": "Apply",
  "application": "Application",
  "applications": "Applications",
  "jobDetails": "Job Details",
  "requirements": "Requirements",
  "qualifications": "Qualifications",
  "benefits": "Benefits",
  "description": "Description",
  "saveJob": "Save Job",
  "savedJobs": "Saved Jobs",
  "applyToJob": "Apply to Job",
  "applicationStatus": "Application Status",
  "pending": "Pending",
  "approved": "Approved",
  "rejected": "Rejected",
  "shortlisted": "Shortlisted"
}
```

#### 3.2 Dashboard Translations
**File:** `Frontend/src/locales/en/dashboard.json`

```json
{
  "dashboard": {
    "overview": "Overview",
    "recentActivity": "Recent Activity",
    "pendingActions": "Pending Actions",
    "statistics": "Statistics",
    "totalUsers": "Total Users",
    "activeJobs": "Active Jobs",
    "revenue": "Revenue",
    "jobseeker": {
      "recommendedJobs": "Recommended Jobs",
      "savedJobs": "Saved Jobs",
      "applications": "Applications",
      "profileSummary": "Profile Summary"
    },
    "company": {
      "myJobs": "My Jobs",
      "candidates": "Candidates",
      "interviews": "Interviews",
      "publishedJobs": "Published Jobs"
    },
    "admin": {
      "userManagement": "User Management",
      "contentModeration": "Content Moderation",
      "reports": "Reports",
      "systemHealth": "System Health"
    }
  }
}
```

#### 3.3 Gig-Related Translations
**File:** `Frontend/src/locales/en/gigs.json`

#### 3.4 Profile Translations
**File:** `Frontend/src/locales/en/profile.json`

#### 3.5 Validation Messages
**File:** `Frontend/src/locales/en/validation.json`

```json
{
  "required": "This field is required",
  "email": "Please enter a valid email address",
  "password": "Password must be at least 8 characters",
  "confirmPassword": "Passwords do not match",
  "phone": "Please enter a valid phone number",
  "url": "Please enter a valid URL",
  "minLength": "Minimum length is {{count}} characters",
  "maxLength": "Maximum length is {{count}} characters"
}
```

### Phase 4: Component Migration (Week 6-7)

#### 4.1 Migration Pattern
**Before:**
```jsx
<Button>Login</Button>
```

**After:**
```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <Button>{t('login')}</Button>;
};
```

#### 4.2 Priority Migration Order
1. **High Priority:** User-facing pages (auth, dashboard, jobs)
2. **Medium Priority:** Forms and validation messages
3. **Low Priority:** Admin panels and internal tools

#### 4.3 Handle Dynamic Content
```jsx
// For dynamic values
<h1>{t('welcomeUser', { name: user.name })}</h1>

// Translation file
{
  "welcomeUser": "Welcome, {{name}}!"
}
```

#### 4.4 Handle Pluralization
```jsx
<p>{t('jobCount', { count: jobs.length })}</p>

// Translation file
{
  "jobCount_one": "{{count}} job",
  "jobCount_other": "{{count}} jobs"
}
```

#### 4.5 Dynamic & User-Generated Content (UGC)

**Database Storage:** Store UGC with an explicit `language` field so the original language is always known:
```sql
ALTER TABLE job_descriptions ADD COLUMN language_code VARCHAR(10) NOT NULL DEFAULT 'en';
```

**Search Indexing:**
- Index only the **original text** to avoid quality issues from machine translation.
- Use language-specific analyzers in Elasticsearch (`arabic`, `french`, etc.) keyed on `language_code`.
- For a translation-proxy approach, maintain a separate translated index and merge at query time.

**User Preference — Show Original vs. Auto-Translate:**
```jsx
const handleTranslate = async () => {
  const res = await fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text: content.body, targetLang: i18n.language }),
  });
  setTranslated((await res.json()).translatedText);
};
// Backend /api/translate proxies to Google Translate or DeepL
// to keep API keys server-side and avoid CORS issues.
```
Expose a "Show translation" toggle in user settings and persist the preference in both localStorage and the backend profile.

#### 4.6 Numbers, Dates, and Currencies

Rely on native **`Intl` APIs** rather than date-fns alone:

```javascript
// Frontend/src/hooks/useFormattedDate.js
import { useTranslation } from 'react-i18next';
export function useFormattedDate() {
  const { i18n } = useTranslation();
  return (date, options = {}) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric', month: 'long', day: 'numeric', ...options,
    }).format(new Date(date));
}
```

```javascript
// Frontend/src/hooks/useFormattedNumber.js
import { useTranslation } from 'react-i18next';
export function useFormattedNumber() {
  const { i18n } = useTranslation();
  return (value, options = {}) =>
    new Intl.NumberFormat(i18n.language, options).format(value);
}
```

**Currency —** store base amount + ISO currency code; format on render:
```jsx
// API: { amount: 5000, currency: "USD" }
const formatNumber = useFormattedNumber();
<span>{formatNumber(job.salary.amount, { style: 'currency', currency: job.salary.currency })}</span>
// → "$5,000.00" in en, "5 000,00 $US" in fr, "٧ ٥٠٠‏ US$" in ar
```

### Phase 5: RTL Styling Support (Week 7)

#### 5.1 Tailwind RTL Plugin (replaces manual rtl.css)

Instead of a custom `rtl.css` override file, use the **`tailwindcss-rtl`** plugin which generates logical-direction utilities automatically.

**File:** `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    require('tailwindcss-rtl'),
  ],
};
```

**Usage in components:**
```jsx
// Instead of: className="ml-4 text-left"
// Use logical variants provided by tailwindcss-rtl:
<div className="ms-4 text-start">...</div>
```

The plugin provides `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, and `text-end` utilities that flip automatically in RTL — no manual overrides needed.

#### 5.2 Component-Specific RTL Adjustments
- Sidebar navigation
- Card layouts
- Form inputs
- Tables
- Modals

#### 5.3 Icon Mirroring
```jsx
// Use logical properties for icons
const ChevronIcon = ({ direction }) => (
  <svg 
    className={direction === 'rtl' ? 'rotate-180' : ''}
    // ... icon path
  />
);
```

### Phase 6: Backend API Internationalization (Week 8)

#### 6.1 API Response Localization
**Current:**
```json
{
  "success": true,
  "message": "Job posted successfully"
}
```

**After:**
```json
{
  "success": true,
  "message": "job_posted_success",
  "messageParams": {}
}
```

#### 6.2 Backend Configuration
**File:** `JobMagnet.API/Configuration/LocalizationConfig.cs`

```csharp
public static class LocalizationConfig
{
    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        services.AddLocalization(options => options.ResourcesPath = "Resources");
        
        services.Configure<RequestLocalizationOptions>(options =>
        {
            var supportedCultures = new[]
            {
                new CultureInfo("en-US"),
                new CultureInfo("ar-EG"),
                new CultureInfo("fr-FR")
            };
            
            options.DefaultRequestCulture = new RequestCulture("en-US");
            options.SupportedCultures = supportedCultures;
            options.SupportedUICultures = supportedCultures;
            
            options.RequestCultureProviders = new List<IRequestCultureProvider>
            {
                new QueryStringRequestCultureProvider(),
                new CookieRequestCultureProvider(),
                new AcceptLanguageHeaderRequestCultureProvider()
            };
        });
        
        return services;
    }
}
```

#### 6.3 Resource Files Structure
```
JobMagnet.API/Resources/
├── Controllers/
│   ├── AuthController.en-US.resx
│   ├── AuthController.ar-EG.resx
│   ├── AuthController.fr-FR.resx
│   ├── JobsController.en-US.resx
│   ├── JobsController.ar-EG.resx
│   └── JobsController.fr-FR.resx
└── Models/
    ├── ErrorMessages.en-US.resx
    ├── ErrorMessages.ar-EG.resx
    └── ErrorMessages.fr-FR.resx
```

#### 6.4 Update API Services
**File:** `Frontend/src/services/ApiService.js`

```javascript
// Add language header
ApiService.interceptors.request.use((config) => {
  const language = i18n.language;
  config.headers['Accept-Language'] = language;
  return config;
});
```

---

## File Structure

### Complete i18n File Structure

```
Frontend/src/
├── i18n/
│   ├── config.js                    # i18next configuration
│   ├── rtl.js                       # RTL utilities
│   └── locales/                     # Translation files
│       ├── en/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── jobs.json
│       │   ├── gigs.json
│       │   ├── profile.json
│       │   ├── errors.json
│       │   └── validation.json
│       ├── ar/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── jobs.json
│       │   ├── gigs.json
│       │   ├── profile.json
│       │   ├── errors.json
│       │   └── validation.json
│       └── fr/
│           ├── common.json
│           ├── auth.json
│           ├── dashboard.json
│           ├── jobs.json
│           ├── gigs.json
│           ├── profile.json
│           ├── errors.json
│           └── validation.json
├── components/
│   └── common/
│       └── LanguageSwitcher.jsx     # Language selector component
├── hooks/
│   └── useLanguageDirection.js     # Custom hook for RTL/LTR
└── styles/
    ├── rtl.css                     # RTL-specific styles
    └── globals.css                 # Updated with RTL support
```

---

## Translation Management

### Translation Key Naming Convention

**Pattern:** `feature.subfeature.key`

**Examples:**
- `auth.login.title` → Login page title
- `dashboard.jobs.apply` → Apply button in jobs section
- `validation.email.invalid` → Invalid email error message
- `errors.network.timeout` → Network timeout error

### Namespace Strategy

**Namespaces:**
- `common` - Shared UI elements (buttons, labels, navigation)
- `auth` - Authentication-related content
- `dashboard` - Dashboard-specific content
- `jobs` - Job posting and application content
- `gigs` - Gig marketplace content
- `profile` - User profile management
- `errors` - Error messages
- `validation` - Form validation messages

### Translation File Organization

**Best Practices:**
1. Keep translation files under 500 lines
2. Group related keys together
3. Use consistent naming conventions
4. Add comments for context
5. Include placeholder descriptions

**Example Structure:**
```json
{
  "_comment": "Authentication page translations",
  "login": {
    "_comment": "Login page section",
    "title": "Login to Your Account",
    "subtitle": "Enter your credentials to access your dashboard",
    "emailLabel": "Email Address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up",
    "loginButton": "Login",
    "socialLogin": "Or continue with",
    "googleLogin": "Continue with Google",
    "linkedinLogin": "Continue with LinkedIn"
  }
}
```

### Translation Workflow

#### 1. Automated Key Extraction with i18next-parser

Add `i18next-parser` to automatically scan components for `t('...')` calls and keep JSON files in sync.

**Configuration:** `i18next-parser.config.js`
```javascript
module.exports = {
  locales: ['en', 'ar', 'fr'],
  defaultNamespace: 'common',
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  keepRemoved: false,  // Remove keys no longer in code
  sort: true,
};
```

**npm script** (`package.json`):
```json
{
  "scripts": {
    "i18n:extract": "i18next-parser"
  }
}
```
Run `npm run i18n:extract` after adding any `t('...')` call. Missing translation keys in non-English locales are flagged automatically.

#### 2. Syncing Translations (CI / Manual)

**Option A — GitHub Actions:**
```yaml
# .github/workflows/i18n-sync.yml
name: i18n Sync Check
on: [push, pull_request]
jobs:
  check-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run i18n:extract
      - name: Fail if translation files changed
        run: git diff --exit-code src/i18n/locales/
```

**Option B — Translation platform CLI:**
- Upload base English JSON to Crowdin/Lokalise via their CLI after each `i18n:extract` run.
- Pull translated files before each release.

#### 3. Initial Translation
- Run `npm run i18n:extract` to produce the baseline English JSON
- Create translation files for target languages
- Professional translation for initial content

#### 4. Quality Assurance
- Review translations for context accuracy
- Test UI with different languages
- Validate RTL layout for Arabic

### Translation Interpolation Security

> **⚠️ XSS Warning:** i18next escapes interpolated values by default. **Never** set `escapeValue: false` globally for strings that include user-supplied content. Additionally, never use `dangerouslySetInnerHTML` with user-provided translation keys or values, as this bypasses React’s built-in XSS protection.

```jsx
// ✅ Safe — i18next escapes the interpolated value
<p>{t('greeting', { name: userInput })}</p>

// ❌ Dangerous — bypasses escaping entirely
<p dangerouslySetInnerHTML={{ __html: t('greeting', { name: userInput }) }} />
```

If you need rich HTML in a translation, use the `<Trans>` component with explicit, trusted component mappings instead.

---

## RTL Support

### RTL Language Detection

**Supported RTL Languages:**
- Arabic (ar)
- Hebrew (he)
- Persian (fa)
- Urdu (ur)

### Automatic Direction Switching

```javascript
// In i18n/config.js
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});
```

### CSS Logical Properties

**Use logical properties instead of physical properties:**

```css
/* Instead of margin-left */
margin-inline-start: 1rem;

/* Instead of padding-right */
padding-inline-end: 1rem;

/* Instead of border-left */
border-inline-start: 1px solid;

/* Instead of text-align: left */
text-align: start;
```

### Component RTL Considerations

**Components requiring special RTL handling:**
1. **Navigation Menus** - Flip menu items and icons
2. **Cards** - Adjust padding and margins
3. **Forms** - Label positioning and input icons
4. **Tables** - Column alignment and sorting indicators
5. **Modals** - Close button positioning
6. **Tooltips** - Arrow direction
7. **Pagination** - Button order and icons

### Testing RTL Layout

**Checklist:**
- [ ] Text alignment (right for RTL)
- [ ] Margin/padding flipping
- [ ] Icon mirroring
- [ ] Flex/grid direction
- [ ] Scrollbar position
- [ ] Form input icons
- [ ] Navigation menu order
- [ ] Table column alignment

---

## Backend API Internationalization

### API Response Strategy

**Option 1: Translation Keys (Recommended)**
```json
{
  "success": true,
  "messageKey": "job_posted_success",
  "data": { ... }
}
```

**Option 2: Pre-translated Messages**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "message_ar": "تم نشر الوظيفة بنجاح",
  "message_fr": "Offre publiée avec succès",
  "data": { ... }
}
```

**Decision:** Option 1 for consistency and maintainability

### Backend Translation Keys Convention

Use **hierarchical dot-separated keys** that mirror the domain action:

| Key | Context |
|-----|---------|
| `api.jobs.create.success` | Job created successfully |
| `api.jobs.apply.error.notFound` | Job not found on apply |
| `api.auth.login.error.invalidCredentials` | Wrong credentials |
| `api.gigs.proposal.submit.success` | Proposal submitted |

All API responses **must** include both a `messageKey` and a default English `message` as a fallback, so the frontend degrades gracefully if a key is missing:

```json
{
  "success": true,
  "messageKey": "api.jobs.create.success",
  "message": "Job posted successfully"
}
```

```json
{
  "success": false,
  "messageKey": "api.auth.login.error.invalidCredentials",
  "message": "Invalid email or password"
}
```

### Backend Implementation Steps

#### 1. Add Localization Services
```csharp
// Program.cs
builder.Services.AddAppLocalization();
app.UseRequestLocalization();
```

#### 2. Create Resource Files
- Add .resx files for each controller
- Include all user-facing messages
- Organize by feature

#### 3. Update Controllers
```csharp
[HttpPost]
public async Task<IActionResult> CreateJob([FromBody] CreateJobDto dto)
{
    var result = await _jobService.CreateJob(dto);
    var message = _localizer["job_posted_success"];
    
    return Ok(new { success = true, messageKey = "job_posted_success", data = result });
}
```

#### 4. Error Message Localization
```csharp
public class ErrorMessages
{
    public string InvalidCredentials => _localizer["invalid_credentials"];
    public string UserNotFound => _localizer["user_not_found"];
    public string EmailAlreadyExists => _localizer["email_already_exists"];
}
```

### Database Content Localization

**Strategy:**
1. **Static Content:** Use translation tables
2. **User-Generated Content:** Store original language, translate on demand
3. **Job Descriptions:** Support multiple language versions

**Database Schema Example:**
```sql
CREATE TABLE jobs (
    id INT PRIMARY KEY,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    title_fr VARCHAR(255),
    description_en TEXT,
    description_ar TEXT,
    description_fr TEXT,
    created_at DATETIME
);
```

---

## SEO & Metadata

### Path-Based Language Detection

Use URL path segments to signal the active language to search engines and users:

```
/en/jobs     → English job listings
/ar/jobs     → Arabic job listings
/fr/jobs     → French job listings
```

**React Router configuration:**
```jsx
<Routes>
  <Route path="/:lang/*" element={<AppShell />} />
  <Route path="*" element={<Navigate to="/en" replace />} />
</Routes>
```
On mount, sync the `:lang` param with `i18n.changeLanguage()`.

### hreflang Tags

Generate `<link rel="alternate" hreflang="x" href="...">` tags in `<head>` for every page:

```jsx
// Frontend/src/components/common/HreflangTags.jsx
import { Helmet } from 'react-helmet-async';
const SUPPORTED_LANGS = ['en', 'ar', 'fr'];

export function HreflangTags({ path }) {
  const base = 'https://maesta.io';
  return (
    <Helmet>
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hreflang={lang} href={`${base}/${lang}${path}`} />
      ))}
      <link rel="alternate" hreflang="x-default" href={`${base}/en${path}`} />
    </Helmet>
  );
}
```

### Language-Specific Sitemaps

Generate a sitemap per language and reference them from `sitemap_index.xml`:

```xml
<!-- public/sitemap_index.xml -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://maesta.io/sitemap-en.xml</loc></sitemap>
  <sitemap><loc>https://maesta.io/sitemap-ar.xml</loc></sitemap>
  <sitemap><loc>https://maesta.io/sitemap-fr.xml</loc></sitemap>
</sitemapindex>
```
Generate per-language sitemaps as part of the CI/CD build step.

---

## Accessibility

### aria-live Announcer for Language Changes

When the language switches, notify assistive technologies via a visually hidden live region:

```jsx
// Frontend/src/components/common/LanguageAnnouncer.jsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageAnnouncer() {
  const { i18n, t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = t('a11y.languageChanged', { lang: i18n.language });
    }
  }, [i18n.language, t]);

  return (
    <div
      ref={ref}
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
    />
  );
}
```
Add `"a11y.languageChanged": "Language changed to {{lang}}"` to all locale files.

### RTL Focus Order & Keyboard Navigation

Switching to RTL via CSS alone does **not** automatically reverse tab focus order — the DOM source order governs focus.

**Checklist:**
- [ ] Verify logical DOM order matches the visual RTL layout (reorder JSX, not just CSS)
- [ ] Test all interactive flows (forms, modals, dropdowns) with keyboard-only navigation in `dir="rtl"` mode
- [ ] Confirm focus rings are visible in RTL
- [ ] Use Playwright/Cypress tests to assert `dir="rtl"` on `<html>` and verify focused elements follow the expected visual order

---

## Testing Strategy

### Unit Testing

**Test Coverage:**
- Translation key existence
- Language switching functionality
- RTL/LTR detection
- Fallback behavior
- Pluralization
- Interpolation

**Example Test:**
```javascript
describe('Language Switcher', () => {
  it('should switch language and update document direction', () => {
    const { getByText } = render(<LanguageSwitcher />);
    const arabicButton = getByText('العربية');
    fireEvent.click(arabicButton);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });
});
```

### Integration Testing

**Test Scenarios:**
1. Complete user flow in each language
2. Form validation in different languages
3. Error message display
4. Date/number formatting
5. RTL layout rendering

### Automated RTL Testing (Playwright / Cypress)

Use end-to-end tools to programmatically verify RTL behavior:

```javascript
// playwright/tests/rtl.spec.js
import { test, expect } from '@playwright/test';

test('switches to Arabic and sets dir=rtl', async ({ page }) => {
  await page.goto('/en/dashboard');
  await page.getByRole('button', { name: /language/i }).click();
  await page.getByText('العربية').click();

  const dir = await page.locator('html').getAttribute('dir');
  expect(dir).toBe('rtl');
});
```

```javascript
// cypress/e2e/rtl.cy.js
it('should render RTL layout for Arabic', () => {
  cy.visit('/ar/dashboard');
  cy.get('html').should('have.attr', 'dir', 'rtl');
  cy.get('[data-testid="sidebar"]').should('have.css', 'direction', 'rtl');
});
```

### Visual Regression Testing

**Tools:**
- Percy
- Chromatic
- Storybook

**Test Cases:**
- Screenshot comparison for each language
- RTL layout verification
- Component rendering consistency

### Manual Testing Checklist

**For Each Language:**
- [ ] All text is translated
- [ ] No hardcoded strings remain
- [ ] Layout is not broken
- [ ] Text fits in containers
- [ ] Date/time formatting is correct
- [ ] Number formatting is correct
- [ ] Currency formatting is correct
- [ ] Error messages are translated
- [ ] Form validation is translated
- [ ] Navigation works correctly
- [ ] RTL layout (for Arabic)

---

## Timeline & Resources

### Project Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Infrastructure | Week 1-2 | i18n setup, language switcher, RTL support |
| Phase 2: Core Translations | Week 3-4 | Auth pages, dashboard navigation, common UI |
| Phase 3: Feature Translations | Week 5-6 | Jobs, gigs, profiles, validation messages |
| Phase 4: Component Migration | Week 6-7 | All components migrated to use translations |
| Phase 5: RTL Styling | Week 7 | Complete RTL support for Arabic |
| Phase 6: Backend i18n | Week 8 | API localization, resource files |
| Phase 7: Testing & QA | Week 8-9 | Comprehensive testing, bug fixes |
| Phase 8: Documentation | Week 9 | Developer documentation, translation guide |

**Total Duration:** 9 weeks

### Resource Requirements

**Team Composition:**
- 1 Senior Frontend Developer (full-time)
- 1 Backend Developer (part-time, 50%)
- 1 Translator/Localization Specialist (contract)
- 1 QA Engineer (part-time, 50%)

**Skills Required:**
- React and i18n experience
- CSS/RTL styling knowledge
- ASP.NET Core localization
- Translation management
- Cross-cultural UX understanding

### Budget Estimate

| Category | Cost |
|----------|------|
| Development (Frontend) | $15,000 - $20,000 |
| Development (Backend) | $8,000 - $12,000 |
| Translation Services | $5,000 - $8,000 |
| Testing & QA | $3,000 - $5,000 |
| Tools & Software | $1,000 - $2,000 |
| **Total** | **$32,000 - $47,000** |

---

## Maintenance & Updates

### Translation Management Workflow

#### 1. New Feature Development
- Developer adds English strings to translation files
- Mark new keys with `_new` flag
- Submit for translation
- Integrate translated versions

#### 2. Translation Updates
- Use translation management platform
- Track changes and version history
- Automated build process for translation files

#### 3. Adding New Languages

**Steps:**
1. Create new language directory in `locales/`
2. Copy English translation files as template
3. Professional translation of all content
4. Add language to supported languages list
5. Test UI with new language
6. Update documentation

**Estimated Time per Language:** 2-3 weeks

### Language Persistence Across Devices

Store the user's language preference in **two places** so it survives device changes and browser clears:

1. **`localStorage`** (client-side, immediate) — handled automatically by `i18next-browser-languagedetector`.
2. **Backend user profile** — persist to `UserPreferences.languageCode` in the database.

**On language change:**
```javascript
i18n.on('languageChanged', async (lng) => {
  localStorage.setItem('i18nextLng', lng); // fast / offline
  if (isAuthenticated) {
    await userService.updatePreferences({ languageCode: lng });
  }
});
```

**On login — sync preference from backend:**
```javascript
// After successful login / token refresh
const { languageCode } = await userService.getPreferences();
if (languageCode && languageCode !== i18n.language) {
  await i18n.changeLanguage(languageCode);
}
```

### Performance Optimization

#### Lazy Loading with React.lazy + Suspense

Use route-level code splitting with `React.lazy` and `Suspense` so each language bundle is only downloaded when needed:

```jsx
const JobsPage = React.lazy(() => import('./pages/JobsPage'));

<Suspense fallback={<PageSpinner />}>
  <JobsPage />
</Suspense>
```

i18next `HttpBackend` loads only the namespace JSON files required for the current route, complementing route-level splitting.

#### Measuring Performance

Run Lighthouse against each language URL and track **Time to Interactive (TTI)** and **LCP**:

```bash
npx lighthouse https://maesta.io/en/jobs --output json --output-path ./reports/en.json
npx lighthouse https://maesta.io/ar/jobs --output json --output-path ./reports/ar.json
```

Target: LCP increase ≤ 250ms compared to the English baseline.

#### Code Splitting
- Load only required language files
- Separate common translations from feature-specific
- Cache translation files in browser

#### Bundle Size Impact
- Estimated increase: 50-100KB per language
- Mitigation: Lazy loading, compression, CDN

### Monitoring & Analytics

**Metrics to Track:**
- Language usage statistics
- Translation coverage percentage
- Missing translation keys
- User language preferences
- Performance impact

**Tools:**
- Google Analytics (language tracking)
- Custom dashboard for translation status
- Error tracking for missing keys

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| RTL layout issues | Medium | High | Early testing, CSS logical properties |
| Translation quality | Medium | Medium | Professional translators, review process |
| Performance degradation | Low | Medium | Lazy loading, caching strategies |
| Backend integration issues | Low | High | Thorough API testing, fallback strategies |
| Browser compatibility | Low | Low | Progressive enhancement, polyfills |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Budget overrun | Medium | Medium | Phased implementation, regular reviews |
| Timeline delays | Medium | High | Realistic estimates, buffer time |
| User adoption | Low | Medium | User testing, feedback loops |
| Maintenance burden | Medium | Low | Automated tools, clear processes |

---

## Success Criteria

### Functional Requirements
- [ ] Support for English, Arabic, and French
- [ ] Seamless language switching
- [ ] Automatic RTL layout for Arabic
- [ ] All user-facing text translated
- [ ] Backend API localized
- [ ] Form validation messages translated
- [ ] Error messages translated

### Non-Functional Requirements
- [ ] Page load time increase < 200ms
- [ ] Bundle size increase < 100KB per language
- [ ] 95% translation coverage
- [ ] No broken layouts in any language
- [ ] Consistent user experience across languages
- [ ] No more than 2% of requests hit a missing translation key
- [ ] LCP increase ≤ 250ms per language (measured via Lighthouse)
- [ ] All API error messages have a corresponding translation key
- [ ] Date, time, and currency formats pass locale-specific snapshot tests

### User Experience
- [ ] Intuitive language switcher
- [ ] Smooth transitions between languages
- [ ] No content loss during language switch
- [ ] Proper date/number/currency formatting
- [ ] Accessible for screen readers in all languages

---

## Appendix

### A. Translation Key Examples

**Common Keys:**
```json
{
  "common": {
    "appName": "MAESTA",
    "welcome": "Welcome",
    "login": "Login",
    "register": "Register"
  }
}
```

**Auth Keys:**
```json
{
  "auth": {
    "login": {
      "title": "Login to Your Account",
      "email": "Email Address",
      "password": "Password"
    },
    "register": {
      "title": "Create Your Account",
      "step1": "Personal Information",
      "step2": "Professional Details"
    }
  }
}
```

### B. RTL CSS Utilities

```css
/* RTL-specific utilities */
[dir="rtl"] .ml-auto { margin-left: auto; margin-right: 0; }
[dir="rtl"] .mr-auto { margin-right: auto; margin-left: 0; }
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
[dir="rtl"] .rotate-0 { transform: rotate(0deg); }
[dir="rtl"] .rotate-180 { transform: rotate(180deg); }
```

### C. Language Codes

| Language | Code | RTL | Culture |
|----------|------|-----|---------|
| English | en | No | en-US |
| Arabic | ar | Yes | ar-EG |
| French | fr | No | fr-FR |
| Spanish | es | No | es-ES |
| German | de | No | de-DE |
| Italian | it | No | it-IT |

### D. Useful Resources

**Documentation:**
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [MDN Web Docs on i18n](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

**Tools:**
- [Crowdin](https://crowdin.com/) - Translation management
- [Lokalise](https://lokalise.com/) - Translation platform
- [Phrase](https://phrase.com/) - Localization software

**Best Practices:**
- [W3C Internationalization](https://www.w3.org/International/)
- [Google Internationalization](https://developer.chrome.com/docs/web/android/internationalization)

---

## Conclusion

This comprehensive internationalization plan provides a structured approach to implementing multi-language support for the MAESTA platform. By following this plan, the project will achieve:

1. **Scalable Architecture:** Easy to add new languages in the future
2. **Professional Quality:** High-quality translations and proper RTL support
3. **User-Friendly Experience:** Seamless language switching and consistent UI
4. **Maintainable Codebase:** Clear organization and documentation
5. **Performance Optimized:** Minimal impact on load times and bundle size

The phased approach allows for incremental implementation, reducing risk and enabling early feedback. With proper execution, MAESTA will be ready to serve a global audience in multiple languages.

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-17  
**Next Review:** 2026-06-17