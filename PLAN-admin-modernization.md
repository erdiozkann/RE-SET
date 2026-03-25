# PLAN-admin-modernization - Admin Panel Modernization & Refactor

**Goal:** Modernize the Admin Panel UI/UX, implement logical categorization for navigation, and restructure the codebase for better maintainability and developer experience.

## 1. Overview

The current Admin Panel has grown to over 16 individual tabs, leading to a cluttered sidebar and difficulties in navigation. The codebase is becoming flat and harder to maintain properly. This refactor aims to:
1.  **Group functionalities** into logical domains (Management, Content, Finance, etc.).
2.  **Implement a collapsible sidebar** with sub-menus for improved UX.
3.  **Refactor the file structure** from a flat list to domain-based modules.
4.  **Standardize UI components** for a "premium" and consistent look.

## 2. Project Type

**WEB APPLICATION** (React + Vite + Supabase)

## 3. Success Criteria

- [ ] Sidebar navigation is grouped into 5-6 main categories.
- [ ] No visual clutter; "premium" look and feel (consistent spacing, typography, colors).
- [ ] Codebase organized into `src/pages/admin/modules/{domain}`.
- [ ] All 16+ existing tabs function correctly within the new structure.
- [ ] Developer experience improved (clearer file locations, shared components).
- [ ] Mobile responsiveness is verified and optimized.

## 4. Proposed Navigation Structure

- **Dashboard** (Ana Sayfa)
- **CRM & Yönetim** (Management)
    - Randevular (Appointments)
    - Danışanlar (Clients)
    - Onay Bekleyenler (Pending Users)
    - Gelişim Takibi (Progress)
- **İçerik Stüdyosu** (Content Studio)
    - Blog
    - Podcast
    - YouTube
    - İçerik Yönetimi (General Content)
    - Reklam Takibi (Ads)
- **Hizmetler & Metodlar** (Services)
    - Hizmetler (Services)
    - Yöntemler (Methods)
- **İletişim & Geri Bildirim** (Communication)
    - Mesajlar (Messages)
    - Yorumlar (Reviews)
- **Finans** (Finance)
    - Muhasebe & Cari (Accounting)
- **Sistem & Ayarlar** (Settings)
    - Yetkili Hesaplar (Accounts)
    - Genel Ayarlar (Config)
    - Profilim (Account Settings)

## 5. Technical Architecture & File Structure

Moving from flat components to **Domain-Driven Directory Structure**:

```text
src/pages/admin/
├── layouts/
│   ├── AdminLayout.tsx        # Main layout with Sidebar & Header
│   ├── Sidebar.tsx            # New grouped sidebar component
│   └── Header.tsx             # Top bar (breadcrumb, notifications, profile)
├── modules/
│   ├── crm/                   # Clients, Appointments, Progress
│   ├── content/               # Blog, Podcast, YouTube, Ads
│   ├── finance/               # Accounting
│   ├── services/              # Services, Methods
│   ├── communication/         # Messages, Reviews
│   └── system/                # Settings, Accounts
├── components/                # Shared admin-specific UI (Tables, Cards, Filters)
└── page.tsx                   # Main entry point (Router/Switcher)
```

## 6. Task Breakdown

### Phase 1: Structural Preparation (Architecture)
- [ ] **Task 1.1:** Create new directory structure (`layouts`, `modules/*`).
- [ ] **Task 1.2:** Move existing component files into their respective modules (Git move).
- [ ] **Task 1.3:** Update imports in `src/pages/admin/page.tsx` to reflect new paths.
- [ ] **Task 1.4:** Verify application compiles without path errors.

### Phase 2: Navigation & Layout Modernization (UI/UX)
- [ ] **Task 2.1:** Create `Sidebar.tsx` with support for collapsible groups (Accordion style).
- [ ] **Task 2.2:** Update navigation array to use the new nested structure.
- [ ] **Task 2.3:** Enhance `Sidebar` aesthetics (Gradient active states, micro-interactions, icons).
- [ ] **Task 2.4:** Refactor `AdminLayout.tsx` to include the new Sidebar and improved Header.

### Phase 3: Component Polish & Standardization (Developer Experience)
- [ ] **Task 3.1:** Create a standard `PageHeader` component (Title, Subtitle, Action Button) and apply to all modules.
- [ ] **Task 3.2:** Standardize "Loading" and "Error" states across all modules using `Suspense` and `ErrorBoundary`.
- [ ] **Task 3.3:** Review and apply `@[skills/clean-code]` principles to the largest components (`ClientsTab`, `DashboardTab`).

### Phase 4: Mobile Optimization
- [ ] **Task 4.1:** Verify Sidebar behavior on mobile (Hamburger menu, overlay drawer).
- [ ] **Task 4.2:** Ensure tables in `Finance` and `CRM` modules are horizontally scrollable or use card view on mobile.

## 7. Agent Assignments

- **Refactoring & Moving Files:** `orchestrator` (careful with git moves)
- **UI/UX Design (Sidebar, Layout):** `frontend-specialist`
- **Component Standardization:** `frontend-specialist`
- **Testing:** `test-engineer`

## 8. Phase X: Verification Checklist

- [ ] **Build Check:** `npm run build` succeeds with no circular dependencies.
- [ ] **Lint Check:** `npm run lint` passes.
- [ ] **Navigation Check:** All menu items open the correct module.
- [ ] **Visual Check:** Sidebar expands/collapses smoothly; Active states are clear.
- [ ] **Mobile Check:** Responsive layout works on <768px.
- [ ] **Regression Check:** Critical flows (Create Client, Add Invoice) still work.
