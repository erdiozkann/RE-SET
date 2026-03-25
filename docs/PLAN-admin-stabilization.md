# PLAN-admin-stabilization.md

## 1. Project Overview
- **Goal**: Stabilize admin panel access, login flow, and authentication without rewriting the codebase.
- **Scope**: Fix critical P0 issues (Admin Refresh, Auth Loop, RLS) and document P1/P2 improvements.
- **Constraints**: No UI/Theme changes, minimal code alterations, no "rewrite from scratch".

## 2. P0 - Stabilization (Immediate Fixes)

### 2.1. Authentication Flow Hardening
- **Objective**: Ensure deterministic role resolution and eliminate redirect loops.
- **Tasks**:
    - [ ] **AuthContext Audit**: 
        - Verify `fetchUserProfile` fallback logic is robust against DB errors.
        - Ensure `loading` state prevents premature redirects.
        - Add explicit "hardcoded admin" check as a fail-safe (done, verify persistence).
    - [ ] **Login Page Logic**:
        - Confirm explicit navigation (done previously) works under all network conditions.
        - Remove any conflicting `useEffect` vs `handleSubmit` navigation logic.

### 2.2. Admin Panel Refresh Fix
- **Objective**: Prevent blank screens or redirects when refreshing `/admin`.
- **Tasks**:
    - [ ] **ProtectedRoute Component**:
        - Analyze `ProtectedRoute.tsx` for race conditions.
        - Ensure it waits for `authLoading` to complete before redirecting.
        - Verify `user.role` check is synchronous after loading completes.
    - [ ] **Router Configuration**:
        - Check `router/config.tsx` for correct wrapping of admin routes.
    - [ ] **Server Configuration (.htaccess)**:
        - Fix syntax errors in `.htaccess` (reported by VS Code).
        - Ensure valid React Router rewrite rules for Apache/Hostinger.

### 2.3. RLS Policy Validation
- **Objective**: Ensure database security allows necessary access.
- **Tasks**:
    - [ ] **Verify `fix_users_rls.sql`**: Confirm policies are non-recursive and correctly applied.
    - [ ] **Verify `fix_booking_rls.sql`**: Ensure booking system has correct permissions.
    - [ ] **Test Access**: 
        - Admin can read/write all `users`.
        - Clients can read/write own data only.
        - Public users can read `services` / `working_config`.

## 3. P1 - Code Health (Cleanup)
- **Objective**: Remove unused code and reduce noise.
- **Tasks**:
    - [ ] Identify unused files in `src/pages` (e.g., experimental auth pages).
    - [ ] Clean up excessive console logs (keep only critical flow logs).
    - [ ] Consolidate Supabase client creation (ensure singleton pattern).

## 4. Verification & Testing
- **Test Cases**:
    1. Admin Login -> Redirects to `/admin`.
    2. Admin Page Refresh -> Stays on `/admin`.
    3. Client Login (Approved) -> Redirects to `/client-panel`.
    4. Client Login (Unapproved) -> Stays on Login / Shows Pending.
    5. Booking Flow -> Services load, appointment creation works.
    6. Logout -> Clears session and redirects to `/`.

## 5. Agent Assignments
- **Orchestrator**: Manage plan execution and cross-component dependencies.
- **Backend Specialist**: Verify RLS SQL and `.htaccess`.
- **Frontend Specialist**: Fix `ProtectedRoute` and Login flow.

## 6. Execution Log
- [ ] Created Plan
- [ ] Validated .htaccess
- [ ] Confirmed RLS Policies
- [ ] Tested Refresh Logic
